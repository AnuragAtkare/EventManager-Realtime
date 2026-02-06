const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    chatType: {
      type: String,
      enum: ['global', 'committee', 'head_subhead'],
      required: true,
    },
    committeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Committee',
      default: null,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message cannot be empty'],
      maxlength: 5000,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

// Index for fast retrieval
chatMessageSchema.index({ eventId: 1, chatType: 1, createdAt: -1 });
chatMessageSchema.index({ eventId: 1, committeeId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
