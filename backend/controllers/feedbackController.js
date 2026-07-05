/**
 * controllers/feedbackController.js — Feedback submission, listing, and detail
 *
 * On POST /api/feedback:
 *  1. Save feedback to DB
 *  2. Async: Call Claude AI for sentiment/themes/urgency
 *  3. Async: Email manager if urgent
 */

const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Team = require('../models/Team');
const Settings = require('../models/Settings');
const { analyzeFeedback } = require('../services/aiService');
const { sendUrgentAlert } = require('../services/emailService');
const logger = require('../config/logger');

// ─── Submit Feedback ───────────────────────────────────────────────────────────
exports.submitFeedback = async (req, res, next) => {
  try {
    const { category, text, mood, isAnonymous, teamId } = req.body;

    // Determine employee reference (null if anonymous)
    const employeeId = isAnonymous ? null : req.user?.id || null;
    const resolvedTeamId = teamId || req.user?.teamId || null;

    // Create feedback document (AI fields default to null — filled async)
    const feedback = await Feedback.create({
      employeeId,
      teamId: resolvedTeamId,
      category,
      text,
      mood,
      isAnonymous: Boolean(isAnonymous),
    });

    // Respond immediately so the user doesn't wait for AI processing
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully.',
      feedback: {
        id: feedback._id,
        category: feedback.category,
        mood: feedback.mood,
        isAnonymous: feedback.isAnonymous,
        createdAt: feedback.createdAt,
      },
    });

    // ─── Async AI processing (non-blocking) ──────────────────────────────────
    processWithAI(feedback, resolvedTeamId).catch((err) =>
      logger.error(`[feedbackController] AI processing error: ${err.message}`)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Processes feedback with Claude AI and triggers alerts if urgent.
 * Runs asynchronously after HTTP response is already sent.
 */
const processWithAI = async (feedback, teamId) => {
  try {
    const analysis = await analyzeFeedback({
      text: feedback.text,
      category: feedback.category,
      mood: feedback.mood,
    });

    // Update feedback with AI results
    await Feedback.findByIdAndUpdate(feedback._id, {
      sentimentScore: analysis.sentimentScore,
      themes: analysis.themes,
      isUrgent: analysis.isUrgent,
      urgentReason: analysis.urgentReason,
      aiSummary: analysis.aiSummary,
      aiProcessed: true,
    });

    logger.info(`[AI] Feedback ${feedback._id} processed. Score: ${analysis.sentimentScore}, Urgent: ${analysis.isUrgent}`);

    // Send urgent alert if flagged
    if (analysis.isUrgent && teamId) {
      await triggerUrgentAlert(feedback, analysis, teamId);
    }
  } catch (err) {
    logger.error(`[AI] Failed for feedback ${feedback._id}: ${err.message}`);
  }
};

/**
 * Finds the team's manager and sends an urgent email alert.
 */
const triggerUrgentAlert = async (feedback, analysis, teamId) => {
  try {
    const team = await Team.findById(teamId).populate('managerId', 'name email');
    if (!team?.managerId) return;

    const updatedFeedback = { ...feedback.toObject(), ...analysis };
    await sendUrgentAlert({
      managerEmail: team.managerId.email,
      managerName: team.managerId.name,
      feedback: updatedFeedback,
    });
  } catch (err) {
    logger.error(`[Alert] Failed to send urgent alert: ${err.message}`);
  }
};

// ─── List Feedback (Manager only) ─────────────────────────────────────────────
exports.listFeedback = async (req, res, next) => {
  try {
    const {
      teamId,
      status,
      isUrgent,
      category,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    // Managers see only their team's feedback
    if (req.user.role === 'manager') {
      filter.teamId = req.user.teamId;
    } else if (teamId) {
      filter.teamId = teamId;
    }

    if (status) filter.status = status;
    if (isUrgent !== undefined) filter.isUrgent = isUrgent === 'true';
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('teamId', 'name'),
      Feedback.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: feedbacks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Feedback Detail ───────────────────────────────────────────────────────
exports.getFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('teamId', 'name')
      .populate({
        path: 'employeeId',
        select: 'name email',
        // Only populate if not anonymous
      });

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found.' });
    }

    // Mask employee info if anonymous
    if (feedback.isAnonymous) {
      feedback.employeeId = null;
    }

    res.json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
};

// ─── Update Feedback Status ────────────────────────────────────────────────────
exports.updateFeedback = async (req, res, next) => {
  try {
    const { status } = req.body;
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found.' });
    }

    res.json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
};
