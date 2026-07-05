/**
 * routes/settings.js — Team settings routes
 * GET   /api/settings
 * PATCH /api/settings
 */

const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authenticate, authorize } = require('../middleware/auth');

// Settings are manager-only
router.use(authenticate, authorize('manager'));

router.get('/',   getSettings);
router.patch('/', updateSettings);

module.exports = router;
