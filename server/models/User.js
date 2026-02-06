const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    middleName: {
      type: String,
      trim: true,
      maxlength: 30,
      default: '',
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    avatar: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return this.middleName
    ? `${this.firstName} ${this.middleName} ${this.lastName}`
    : `${this.firstName} ${this.lastName}`;
});

// Virtual for display name (First + Last only)
userSchema.virtual('displayName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from response
userSchema.methods.toJSON = function () {
  const user = this.toObject({ virtuals: true });
  delete user.password;
  delete user.id; // Remove duplicate _id as id
  return user;
};

module.exports = mongoose.model('User', userSchema);
