// models/employeeModel.js — Defines the Mongoose schema and model for the Employee entity

const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    timezone: {
      type: String,
      trim: true,
    },
    primarySkill: {
      type: String,
      trim: true,
    },
    secondarySkill: {
      type: String,
      trim: true,
    },
    domain: {
      type: String,
      trim: true,
    },
    experience: {
      type: Number,
      default: 0,
      min: [0, 'Experience cannot be negative'],
    },
    certifications: {
      type: [String],
      default: [],
    },
    projects: {
      type: [String],
      default: [],
    },
    tasks: {
      type: [String],
      default: [],
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ─── Indexes for performance ───────────────────────────────────
employeeSchema.index({ name: 1 });
employeeSchema.index({ primarySkill: 1 });
employeeSchema.index({ country: 1, city: 1 });
employeeSchema.index({ domain: 1 });
employeeSchema.index({ experience: -1 });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
