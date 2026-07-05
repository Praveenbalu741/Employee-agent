/**
 * controllers/dashboardController.js — Analytics aggregation for managers
 */

const Feedback = require('../models/Feedback');

// ─── Sentiment Trends ──────────────────────────────────────────────────────────
// Returns average sentiment score grouped by day, week, or month
exports.getSentimentTrends = async (req, res, next) => {
  try {
    const { teamId, period = 'day', startDate, endDate } = req.query;
    const resolvedTeamId = teamId || req.user.teamId;

    const matchStage = { aiProcessed: true };
    if (resolvedTeamId) matchStage.teamId = resolvedTeamId;
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    // Define the date group key based on period
    const dateGroupFormats = {
      day:   { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } },
      week:  { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } },
      month: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
    };

    const groupBy = dateGroupFormats[period] || dateGroupFormats.day;

    const trends = await Feedback.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupBy,
          avgSentiment: { $avg: '$sentimentScore' },
          count: { $sum: 1 },
          urgentCount: { $sum: { $cond: ['$isUrgent', 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
    ]);

    res.json({ success: true, data: trends, period });
  } catch (error) {
    next(error);
  }
};

// ─── Theme Frequency ───────────────────────────────────────────────────────────
// Returns count of each theme tag across all feedback
exports.getThemes = async (req, res, next) => {
  try {
    const { teamId, startDate, endDate } = req.query;
    const resolvedTeamId = teamId || req.user.teamId;

    const matchStage = { aiProcessed: true };
    if (resolvedTeamId) matchStage.teamId = resolvedTeamId;
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const themes = await Feedback.aggregate([
      { $match: matchStage },
      { $unwind: '$themes' },                          // Expand themes array
      { $group: { _id: '$themes', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
      { $project: { theme: '$_id', count: 1, _id: 0 } },
    ]);

    res.json({ success: true, data: themes });
  } catch (error) {
    next(error);
  }
};

// ─── Urgent Flags ─────────────────────────────────────────────────────────────
// Returns unresolved urgent feedback items for manager action
exports.getUrgentFlags = async (req, res, next) => {
  try {
    const { teamId } = req.query;
    const resolvedTeamId = teamId || req.user.teamId;

    const filter = { isUrgent: true, status: { $ne: 'resolved' } };
    if (resolvedTeamId) filter.teamId = resolvedTeamId;

    const urgent = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('teamId', 'name')
      .select('category mood urgentReason aiSummary status createdAt isAnonymous');

    res.json({ success: true, data: urgent, total: urgent.length });
  } catch (error) {
    next(error);
  }
};

// ─── Overview Stats ────────────────────────────────────────────────────────────
exports.getOverview = async (req, res, next) => {
  try {
    const { teamId } = req.query;
    const resolvedTeamId = teamId || req.user.teamId;

    const filter = {};
    if (resolvedTeamId) filter.teamId = resolvedTeamId;

    const [total, urgent, avgSentiment, byMood] = await Promise.all([
      Feedback.countDocuments(filter),
      Feedback.countDocuments({ ...filter, isUrgent: true, status: { $ne: 'resolved' } }),
      Feedback.aggregate([
        { $match: { ...filter, aiProcessed: true } },
        { $group: { _id: null, avg: { $avg: '$sentimentScore' } } },
      ]),
      Feedback.aggregate([
        { $match: filter },
        { $group: { _id: '$mood', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalFeedback: total,
        urgentUnresolved: urgent,
        avgSentiment: avgSentiment[0]?.avg?.toFixed(2) || 0,
        moodDistribution: byMood,
      },
    });
  } catch (error) {
    next(error);
  }
};
