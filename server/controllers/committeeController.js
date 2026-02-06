const Committee = require('../models/Committee');
const Event = require('../models/Event');

// POST /api/committees/create  (Head only)
const createCommittee = async (req, res) => {
  try {
    const { eventId, name, description } = req.body;

    if (!eventId || !name) {
      return res.status(400).json({ success: false, message: 'Event ID and committee name are required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (event.head.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only Event Head can create committees' });
    }

    const existing = await Committee.findOne({ eventId, name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A committee with this name already exists' });
    }

    const committee = new Committee({ eventId, name, description });
    await committee.save();

    res.status(201).json({ success: true, message: 'Committee created', data: { committee } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/committees/:eventId  (Participants only)
const getCommittees = async (req, res) => {
  try {
    const { eventId } = req.params;
    const committees = await Committee.find({ eventId, isActive: true })
      .populate('subHead', 'firstName middleName lastName email avatar')
      .populate('volunteers', 'firstName middleName lastName email avatar');

    res.status(200).json({ success: true, data: { committees } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/committees/:committeeId/assign-subhead  (Head only)
const assignSubHead = async (req, res) => {
  try {
    const { committeeId } = req.params;
    const { userId } = req.body;

    const committee = await Committee.findById(committeeId);
    if (!committee) {
      return res.status(404).json({ success: false, message: 'Committee not found' });
    }

    const event = await Event.findById(committee.eventId);
    if (event.head.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only Event Head can assign sub-heads' });
    }

    // Verify user is a participant
    const participant = event.participants.find(
      (p) => p.userId.toString() === userId
    );
    if (!participant) {
      return res.status(400).json({ success: false, message: 'User is not a participant of this event' });
    }

    // Update role to subhead in event
    participant.role = 'subhead';
    participant.committeeId = committeeId;
    await event.save();

    // Assign sub-head to committee
    committee.subHead = userId;
    await committee.save();

    res.status(200).json({ success: true, message: 'Sub-head assigned successfully', data: { committee } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/committees/join-committees  (Volunteer submits preferences — instant join)
const joinCommittees = async (req, res) => {
  try {
    const { eventId, committeeIds } = req.body;

    if (!eventId || !committeeIds || !Array.isArray(committeeIds)) {
      return res.status(400).json({ success: false, message: 'eventId and committeeIds array are required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Verify user is participant
    const participant = event.participants.find(
      (p) => p.userId.toString() === req.user._id.toString()
    );
    if (!participant) {
      return res.status(403).json({ success: false, message: 'You are not a participant of this event' });
    }

    // Sub-heads cannot join committees - they're assigned
    if (participant.role === 'subhead') {
      return res.status(403).json({ success: false, message: 'Sub-heads cannot join committees. You are assigned to your committee.' });
    }

    // Check current committee count
    const currentCommittees = await Committee.find({ eventId, volunteers: req.user._id });
    const newJoins = committeeIds.filter(cId => !currentCommittees.some(c => c._id.toString() === cId));
    const totalAfterJoin = currentCommittees.length + newJoins.length;

    // Enforce join limit
    const limit = event.committeeJoinLimit;
    let maxAllowed = 999;
    if (limit === 'one') maxAllowed = 1;
    if (limit === 'two') maxAllowed = 2;

    if (totalAfterJoin > maxAllowed) {
      return res.status(400).json({
        success: false,
        message: `You can only join ${maxAllowed} committee${maxAllowed > 1 ? 's' : ''}. You are already in ${currentCommittees.length}.`
      });
    }

    const joinedCommittees = [];

    for (const cId of committeeIds) {
      const committee = await Committee.findOne({ _id: cId, eventId });
      if (!committee) continue;

      // Add volunteer if not already in committee
      const alreadyIn = committee.volunteers.some(
        (v) => v.toString() === req.user._id.toString()
      );
      if (!alreadyIn) {
        committee.volunteers.push(req.user._id);
        await committee.save();
        joinedCommittees.push(committee.name);
      }
    }

    res.status(200).json({
      success: true,
      message: joinedCommittees.length
        ? `Joined committees: ${joinedCommittees.join(', ')}`
        : 'No new committees joined',
      data: { joinedCommittees },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/committees/:committeeId/remove-volunteer/:userId
const removeVolunteer = async (req, res) => {
  try {
    const { committeeId, userId } = req.params;
    const committee = await Committee.findById(committeeId);
    if (!committee) {
      return res.status(404).json({ success: false, message: 'Committee not found' });
    }

    const event = await Event.findById(committee.eventId);
    const isHead = event.head.toString() === req.user._id.toString();
    const isSubhead = committee.subHead?.toString() === req.user._id.toString();

    if (!isHead && !isSubhead) {
      return res.status(403).json({ success: false, message: 'Only Head or Sub-head can remove volunteers' });
    }

    committee.volunteers = committee.volunteers.filter((v) => v.toString() !== userId);
    await committee.save();

    res.status(200).json({ success: true, message: 'Volunteer removed from committee' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/committees/:committeeId  (Head only)
const deleteCommittee = async (req, res) => {
  try {
    const { committeeId } = req.params;
    const committee = await Committee.findById(committeeId);
    if (!committee) {
      return res.status(404).json({ success: false, message: 'Committee not found' });
    }

    const event = await Event.findById(committee.eventId);
    if (event.head.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only Event Head can delete committees' });
    }

    await Committee.findByIdAndDelete(committeeId);
    res.status(200).json({ success: true, message: 'Committee deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createCommittee,
  getCommittees,
  assignSubHead,
  joinCommittees,
  removeVolunteer,
  deleteCommittee,
};
