const ChatMessage = require('../models/ChatMessage');
const Event = require('../models/Event');
const Committee = require('../models/Committee');

// POST /api/chat/send
const sendMessage = async (req, res) => {
  try {
    const { eventId, chatType, committeeId, message } = req.body;

    if (!eventId || !chatType || !message) {
      return res.status(400).json({ success: false, message: 'eventId, chatType, and message are required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Authorization checks
    const isHead = event.head.toString() === req.user._id.toString();
    const participant = event.participants.find(
      (p) => p.userId.toString() === req.user._id.toString()
    );

    if (!isHead && !participant) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Committee chat: verify user is in the committee
    if (chatType === 'committee' && committeeId) {
      const committee = await Committee.findById(committeeId);
      if (!committee) {
        return res.status(404).json({ success: false, message: 'Committee not found' });
      }
      const isSubhead = committee.subHead?.toString() === req.user._id.toString();
      const isVolunteer = committee.volunteers.some((v) => v.toString() === req.user._id.toString());
      if (!isHead && !isSubhead && !isVolunteer) {
        return res.status(403).json({ success: false, message: 'You are not in this committee' });
      }
    }

    // Head-Subhead chat: only head or subheads allowed
    if (chatType === 'head_subhead') {
      if (!isHead && participant?.role !== 'subhead') {
        return res.status(403).json({ success: false, message: 'Only Head or Sub-heads can use this chat' });
      }
    }

    const chatMessage = new ChatMessage({
      eventId,
      chatType,
      committeeId: committeeId || null,
      sender: req.user._id,
      message,
    });

    await chatMessage.save();

    // Populate sender info
    await chatMessage.populate('sender', 'firstName middleName lastName email avatar');

    res.status(201).json({ success: true, data: { message: chatMessage } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/chat/:eventId/:chatType
const getChatHistory = async (req, res) => {
  try {
    const { eventId, chatType } = req.params;
    const { committeeId, limit = 50, skip = 0 } = req.query;

    const query = { eventId, chatType };
    if (committeeId) query.committeeId = committeeId;

    const messages = await ChatMessage.find(query)
      .populate('sender', 'firstName middleName lastName email avatar')
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    // Return in chronological order
    messages.reverse();

    res.status(200).json({ success: true, data: { messages } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { sendMessage, getChatHistory };
