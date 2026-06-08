// models/userModel.js
// Purpose: Mongoose schema for authentication users (separate from Employee).
//          Stores credentials, OTP, and password reset tokens.
//          Follows Checklist: no business logic in the model layer.

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ─── Identity ──────────────────────────────────────────────
    name: {
      type:      String,
      trim:      true,
      default:   '',
    },

    email: {
      type:     String,
      required: [true, 'Email is required'],
      unique:   true,
      lowercase: true,
      trim:     true,
      match:    [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },

    password: {
      type:     String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select:   false, // never returned in queries by default
    },

    // ─── Role ──────────────────────────────────────────────────
    role: {
      type:    String,
      enum:    ['user', 'admin'],
      default: 'user',
    },

    // ─── Email Verification ────────────────────────────────────
    isEmailVerified: {
      type:    Boolean,
      default: false,
    },

    emailVerificationToken: {
      type:    String,
      default: null,
    },

    // ─── OTP ───────────────────────────────────────────────────
    otp: {
      type:    String,
      default: null,
    },

    otpExpiry: {
      type:    Date,
      default: null,
    },

    isOtpVerified: {
      type:    Boolean,
      default: false,
    },

    // ─── Password Reset ────────────────────────────────────────
    resetPasswordToken: {
      type:    String,
      default: null,
    },

    resetPasswordExpiry: {
      type:    Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Indexes ────────────────────────────────────────────────────
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
