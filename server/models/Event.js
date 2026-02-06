const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const participantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: {
    type: String,
    enum: ['head', 'subhead', 'volunteer'],
    default: 'volunteer',
  },
  committeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Committee', default: null },
  joinedAt: { type: Date, default: Date.now },
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    eventCode: {
      type: String,
      unique: true,
      default: () => uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase(),
      uppercase: true,
    },
    eventType: {
      type: String,
      enum: ['small', 'large'],
      default: 'small',
    },
    hasCommittees: {
      type: Boolean,
      default: false,
    },
    committeeJoinLimit: {
      type: String,
      enum: ['one', 'two', 'multiple'],
      default: 'multiple',
    },
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [participantSchema],
    startDate: { type: Date },
    endDate: { type: Date },
    coverImage: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Ensure unique participants
eventSchema.methods.addParticipant = function (userId, role = 'volunteer') {
  const exists = this.participants.find((p) => p.userId.toString() === userId.toString());
  if (!exists) {
    this.participants.push({ userId, role });
  }
  return this;
};

eventSchema.methods.removeParticipant = function (userId) {
  this.participants = this.participants.filter(
    (p) => p.userId.toString() !== userId.toString()
  );
  return this;
};

eventSchema.methods.getParticipantRole = function (userId) {
  const participant = this.participants.find((p) => p.userId.toString() === userId.toString());
  return participant ? participant.role : null;
};

module.exports = mongoose.model('Event', eventSchema);
