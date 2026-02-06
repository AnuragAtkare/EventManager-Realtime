const Event = require('../models/Event');
const Committee = require('../models/Committee');
const User = require('../models/User');

// POST /api/events/create
const createEvent = async (req, res) => {
  try {
    const { title, description, eventType, hasCommittees, committeeJoinLimit, startDate, endDate } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Event title is required' });
    }

    const event = new Event({
      title,
      description: description || '',
      eventType: eventType || 'small',
      hasCommittees: hasCommittees || false,
      committeeJoinLimit: committeeJoinLimit || 'multiple',
      head: req.user._id,
      startDate,
      endDate,
    });

    // Head is automatically a participant with role 'head'
    event.participants.push({
      userId: req.user._id,
      role: 'head',
    });

    await event.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/events/join
const joinEvent = async (req, res) => {
  try {
    const { eventCode } = req.body;

    if (!eventCode) {
      return res.status(400).json({ success: false, message: 'Event code is required' });
    }

    const event = await Event.findOne({ eventCode: eventCode.toUpperCase() });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found. Check the code and try again.' });
    }

    if (!event.isActive) {
      return res.status(400).json({ success: false, message: 'This event is no longer active' });
    }

    // Check if already joined
    const alreadyJoined = event.participants.some(
      (p) => p.userId.toString() === req.user._id.toString()
    );
    if (alreadyJoined) {
      return res.status(200).json({
        success: true,
        message: 'You are already a participant',
        data: { event },
      });
    }

    // Instant join — no approval
    event.addParticipant(req.user._id, 'volunteer');
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Successfully joined the event!',
      data: { event },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/events/my-events
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({
      $or: [
        { head: req.user._id },
        { 'participants.userId': req.user._id },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { events } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/events/:eventId
const getEventDetails = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate('head', 'firstName middleName lastName email avatar')
      .populate('participants.userId', 'firstName middleName lastName email avatar');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, data: { event } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/events/:eventId/remove/:userId  (Head only)
const removeParticipant = async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Only head can remove
    if (event.head.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only Event Head can remove participants' });
    }

    // Cannot remove the head
    if (userId === event.head.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot remove the Event Head' });
    }

    event.removeParticipant(userId);

    // Also remove from all committees
    await Committee.updateMany(
      { eventId },
      { $pull: { volunteers: userId } }
    );

    await event.save();

    res.status(200).json({ success: true, message: 'Participant removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/events/:eventId/volunteers
const getVolunteers = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate('participants.userId', 'firstName middleName lastName email avatar');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Only head or subheads can view full list
    const isHead = event.head.toString() === req.user._id.toString();
    if (!isHead) {
      const participant = event.participants.find(
        (p) => p.userId._id?.toString() === req.user._id.toString() ||
               p.userId.toString() === req.user._id.toString()
      );
      if (!participant || participant.role === 'volunteer') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const volunteers = event.participants.filter((p) => p.role !== 'head');

    res.status(200).json({ success: true, data: { volunteers } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/events/:eventId/export-pdf
const exportVolunteersPDF = async (req, res) => {
  try {
    const { committeeId } = req.query;
    const event = await Event.findById(req.params.eventId)
      .populate('participants.userId', 'firstName middleName lastName email avatar')
      .populate('head', 'firstName middleName lastName email');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Only head can export
    if (event.head._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only Event Head can export' });
    }

    let volunteers = event.participants.filter((p) => p.role !== 'head');
    let title = `${event.title} - All Volunteers`;

    // Filter by committee if requested
    if (committeeId) {
      const Committee = require('../models/Committee');
      const committee = await Committee.findById(committeeId).populate('volunteers', 'firstName middleName lastName email');
      if (committee) {
        const committeeUserIds = committee.volunteers.map((v) => v._id.toString());
        volunteers = volunteers.filter((v) => committeeUserIds.includes(v.userId._id.toString()));
        title = `${event.title} - ${committee.name} Committee`;
      }
    }

    // Build simple HTML for PDF
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #6c63ff; border-bottom: 3px solid #6c63ff; padding-bottom: 10px; }
          .meta { color: #666; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #6c63ff; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:hover { background: #f5f5f5; }
          .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="meta">
          <p><strong>Event Head:</strong> ${event.head.firstName} ${event.head.lastName}</p>
          <p><strong>Total Volunteers:</strong> ${volunteers.length}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            ${volunteers.map((v, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${v.userId.firstName} ${v.userId.middleName || ''} ${v.userId.lastName}</td>
                <td>${v.userId.email}</td>
                <td style="text-transform: capitalize;">${v.role}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>EventManager - Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;

    res.status(200).json({ success: true, data: { html, title } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createEvent, joinEvent, getMyEvents, getEventDetails, removeParticipant, getVolunteers, exportVolunteersPDF };
