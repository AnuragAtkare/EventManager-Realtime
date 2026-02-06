const Announcement = require('../models/Announcement');
const Event = require('../models/Event');
const Committee = require('../models/Committee');

// POST /api/announcements/create
const createAnnouncement = async (req, res) => {
  try {
    const { eventId, type, committeeId, title, content, paymentAmount, paymentPurpose, paymentDeadline, expiryDate } = req.body;

    if (!eventId || !type || !title || !content) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const isHead = event.head.toString() === req.user._id.toString();
    const participant = event.participants.find(p => p.userId.toString() === req.user._id.toString());
    const isSubhead = participant && participant.role === 'subhead';

    // Authorization
    if (type === 'payment') {
      // Only Head can create payment announcements
      if (!isHead) {
        return res.status(403).json({ success: false, message: 'Only Event Head can create payment announcements' });
      }
    }

    if (type === 'global') {
      // Head or Sub-head can create global announcements
      if (!isHead && !isSubhead) {
        return res.status(403).json({ success: false, message: 'Only Head or Sub-heads can create global announcements' });
      }
    }

    if (type === 'committee') {
      if (!committeeId) {
        return res.status(400).json({ success: false, message: 'committeeId is required for committee announcements' });
      }
      const committee = await Committee.findById(committeeId);
      if (!committee) {
        return res.status(404).json({ success: false, message: 'Committee not found' });
      }
      const isCommitteeSubhead = committee.subHead?.toString() === req.user._id.toString();
      
      // Head or committee's sub-head can create committee announcements
      if (!isHead && !isCommitteeSubhead) {
        return res.status(403).json({ success: false, message: 'Only Head or committee Sub-head can create committee announcements' });
      }
    }

    // Payment validation
    if (type === 'payment') {
      if (!paymentAmount || paymentAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Payment amount must be positive' });
      }
    }

    const announcement = new Announcement({
      eventId,
      type,
      committeeId: committeeId || null,
      title,
      content,
      createdBy: req.user._id,
      paymentAmount: type === 'payment' ? paymentAmount : null,
      paymentPurpose: type === 'payment' ? paymentPurpose : null,
      paymentDeadline: type === 'payment' ? paymentDeadline : null,
      expiryDate: expiryDate || null,
    });

    await announcement.save();
    await announcement.populate('createdBy', 'firstName middleName lastName email avatar');

    res.status(201).json({ success: true, message: 'Announcement created', data: { announcement } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/announcements/:eventId
const getAnnouncements = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { type, committeeId } = req.query;

    const query = { eventId };
    if (type) query.type = type;
    if (committeeId) query.committeeId = committeeId;

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'firstName middleName lastName email avatar')
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({ success: true, data: { announcements } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/announcements/:id/pin  (Head only)
const pinAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    const event = await Event.findById(announcement.eventId);
    if (event.head.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only Head can pin announcements' });
    }

    announcement.isPinned = !announcement.isPinned;
    await announcement.save();

    res.status(200).json({ success: true, message: announcement.isPinned ? 'Pinned' : 'Unpinned', data: { announcement } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/announcements/:id  (Head only)
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    const event = await Event.findById(announcement.eventId);
    if (event.head.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only Head can delete announcements' });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createAnnouncement, getAnnouncements, pinAnnouncement, deleteAnnouncement };
