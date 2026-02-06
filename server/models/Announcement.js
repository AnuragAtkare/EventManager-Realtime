const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    type: {
      type: String,
      enum: ['global', 'committee', 'payment'],
      required: true,
    },
    committeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Committee',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: 200,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: 3000,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Payment-specific fields
    paymentAmount: {
      type: Number,
      default: null,
    },
    paymentPurpose: {
      type: String,
      default: null,
    },
    paymentDeadline: {
      type: Date,
      default: null,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

announcementSchema.index({ eventId: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
