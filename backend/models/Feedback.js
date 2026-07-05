/**
 * models/Feedback.js — Core feedback document with AI-enriched fields
 */

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    // Reference to the submitting employee (null if anonymous)
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },

    // ─── Feedback Content ──────────────────────────────────────────────────────
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    text: {
      type: String,
      required: [true, 'Feedback text is required'],
      trim: true,
      maxlength: [5000, 'Feedback cannot exceed 5000 characters'],
    },
    mood: {
      type: String,
      enum: ['very_happy', 'happy', 'neutral', 'unhappy', 'very_unhappy'],
      required: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },

    // ─── AI-Processed Fields (populated by Claude) ────────────────────────────
    sentimentScore: {
      type: Number,
      min: -1,
      max: 1,
      default: null,
    },
    themes: {
      type: [String],
      default: [],
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    aiSummary: {
      type: String,
      default: null,
    },
    urgentReason: {
      type: String,
      default: null, // e.g., "harassment", "burnout", "safety"
    },
    aiProcessed: {
      type: Boolean,
      default: false,
    },

    // ─── Status Tracking ───────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['open', 'reviewed', 'resolved'],
      default: 'open',
    },
  },
  { timestamps: true }
);

// ─── Indexes for efficient querying ───────────────────────────────────────────
feedbackSchema.index({ teamId: 1, createdAt: -1 });
feedbackSchema.index({ isUrgent: 1, status: 1 });
feedbackSchema.index({ sentimentScore: 1 });
feedbackSchema.index({ employeeId: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
