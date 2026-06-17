// models/employeeModel.js
// Purpose: Defines the Mongoose schema and model for the Employee entity.
//          Contains field definitions, validation rules, and performance indexes.
//          This layer ONLY deals with database structure — no business logic.

const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    // ─── Identity ─────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },

    phone: {
      type: String,
      trim: true,
      match: [/^[+]?[\d\s\-().]{7,20}$/, 'Please enter a valid phone number'],
    },

    // ─── Location ─────────────────────────────────────────────
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

    // ─── Skills & Role ────────────────────────────────────────
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
      max: [60, 'Experience value seems too high'],
    },

    // ─── Arrays ───────────────────────────────────────────────
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

    // ─── Status ───────────────────────────────────────────────
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // auto-adds: createdAt, updatedAt
    versionKey: false, // removes __v field from documents
  }
);

// ─── Indexes for Performance (Checklist #15) ──────────────────
// Compound + single field indexes on frequently filtered fields
employeeSchema.index({ name: 1 });

employeeSchema.index({ primarySkill: 1 });
employeeSchema.index({ secondarySkill: 1 });
employeeSchema.index({ domain: 1 });
employeeSchema.index({ experience: -1 });
employeeSchema.index({ country: 1 });
employeeSchema.index({ city: 1 });
employeeSchema.index({ state: 1 });
employeeSchema.index({ timezone: 1 });
employeeSchema.index({ isVerified: 1 });
employeeSchema.index({ country: 1, city: 1 }); // compound: location filter
employeeSchema.index({ domain: 1, experience: -1 }); // compound: domain + seniority

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
