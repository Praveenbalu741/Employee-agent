/**
 * routes/feedback.js — Feedback submission and management routes
 * POST  /api/feedback         - Submit feedback (employee or anonymous)
 * GET   /api/feedback         - List feedback (manager only)
 * GET   /api/feedback/:id     - Get feedback detail
 * PATCH /api/feedback/:id     - Update feedback status (manager only)
 */

const express = require('express');
const router = express.Router();
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const {
  submitFeedback,
  listFeedback,
  getFeedback,
  updateFeedback,
} = require('../controllers/feedbackController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// ─── Rate limiter: 10 submissions per 15 minutes per IP ───────────────────────
const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many submissions. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Validation schemas ────────────────────────────────────────────────────────
const submitSchema = Joi.object({
  category: Joi.string().trim().min(2).max(100).required(),
  text: Joi.string().trim().min(10).max(5000).required().messages({
    'string.min': 'Feedback must be at least 10 characters.',
  }),
  mood: Joi.string().valid('very_happy', 'happy', 'neutral', 'unhappy', 'very_unhappy').required(),
  isAnonymous: Joi.boolean().default(false),
  teamId: Joi.string().optional().allow('', null),
});

const updateSchema = Joi.object({
  status: Joi.string().valid('open', 'reviewed', 'resolved').required(),
});

// ─── Routes ───────────────────────────────────────────────────────────────────
// Anyone (even unauthenticated) can submit — anonymous submissions allowed
router.post('/', feedbackLimiter, validate(submitSchema), submitFeedback);

// Manager-only routes
router.get('/',     authenticate, authorize('manager'), listFeedback);
router.get('/:id',  authenticate, authorize('manager'), getFeedback);
router.patch('/:id', authenticate, authorize('manager'), validate(updateSchema), updateFeedback);

module.exports = router;
