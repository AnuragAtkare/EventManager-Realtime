const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Event = require('../models/Event');

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Check if user is the event head
const requireHead = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (event.head.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only Event Head can perform this action' });
    }
    req.event = event;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Check if user is head or subhead of event
const requireHeadOrSubhead = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    const isHead = event.head.toString() === req.user._id.toString();
    const participant = event.participants.find(
      (p) => p.userId.toString() === req.user._id.toString()
    );
    const isSubhead = participant && participant.role === 'subhead';

    if (!isHead && !isSubhead) {
      return res.status(403).json({ success: false, message: 'Head or Sub-head access required' });
    }
    req.event = event;
    req.isHead = isHead;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Check if user is a participant in the event
const requireParticipant = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    const isHead = event.head.toString() === req.user._id.toString();
    const isParticipant = event.participants.some(
      (p) => p.userId.toString() === req.user._id.toString()
    );
    if (!isHead && !isParticipant) {
      return res.status(403).json({ success: false, message: 'You are not a participant of this event' });
    }
    req.event = event;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { authenticate, requireHead, requireHeadOrSubhead, requireParticipant };
