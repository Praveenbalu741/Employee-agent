/**
 * controllers/settingsController.js — Team settings CRUD
 */

const Settings = require('../models/Settings');

// ─── Get Settings ──────────────────────────────────────────────────────────────
exports.getSettings = async (req, res, next) => {
  try {
    const teamId = req.query.teamId || req.user.teamId;
    if (!teamId) {
      return res.status(400).json({ success: false, message: 'Team ID required.' });
    }

    let settings = await Settings.findOne({ teamId });

    // Auto-create default settings if they don't exist yet
    if (!settings) {
      settings = await Settings.create({ teamId });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// ─── Update Settings ───────────────────────────────────────────────────────────
exports.updateSettings = async (req, res, next) => {
  try {
    const teamId = req.body.teamId || req.user.teamId;
    if (!teamId) {
      return res.status(400).json({ success: false, message: 'Team ID required.' });
    }

    const allowedUpdates = [
      'feedbackCategories',
      'anonymityDefault',
      'notificationPreferences',
      'urgentKeywords',
    ];

    const updates = {};
    allowedUpdates.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const settings = await Settings.findOneAndUpdate(
      { teamId },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};
