/**
 * routes/dashboard.js — Manager analytics routes
 * GET /api/dashboard/sentiment-trends
 * GET /api/dashboard/themes
 * GET /api/dashboard/urgent
 * GET /api/dashboard/overview
 */

const express = require('express');
const router = express.Router();
const {
  getSentimentTrends,
  getThemes,
  getUrgentFlags,
  getOverview,
} = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

// All dashboard routes require manager authentication
router.use(authenticate, authorize('manager'));

router.get('/sentiment-trends', getSentimentTrends);
router.get('/themes',           getThemes);
router.get('/urgent',           getUrgentFlags);
router.get('/overview',         getOverview);

module.exports = router;
