/**
 * models/Settings.js — Manager-configurable settings per team
 */

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      unique: true,
    },
    feedbackCategories: {
      type: [String],
      default: ['Workload', 'Management', 'Culture', 'Compensation', 'Work-Life Balance', 'Career Growth', 'Other'],
    },
    anonymityDefault: {
      type: Boolean,
      default: false, // Whether feedback is anonymous by default
    },
    notificationPreferences: {
      urgentEmail: {
        type: Boolean,
        default: true, // Email manager on urgent flags
      },
      weeklyDigest: {
        type: Boolean,
        default: true, // Weekly summary email
      },
      webhookUrl: {
        type: String,
        default: null, // Optional webhook for Slack/Teams integration
      },
    },
    urgentKeywords: {
      type: [String],
      default: ['harassment', 'burnout', 'toxic', 'quit', 'unsafe', 'discrimination', 'mental health', 'anxiety', 'depression'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
