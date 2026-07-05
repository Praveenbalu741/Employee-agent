/**
 * services/aiService.js — Anthropic Claude AI integration for feedback processing
 *
 * Responsibilities:
 *  1. Generate sentiment score (-1 to 1)
 *  2. Extract theme tags
 *  3. Flag urgent/sensitive content
 *  4. Generate a concise AI summary
 *
 * All Claude calls are designed to return structured JSON for reliable parsing.
 */

const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../config/logger');

// Initialize Anthropic client (reads ANTHROPIC_API_KEY from env)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-3-5-sonnet-20241022';

/**
 * Analyzes employee feedback using Claude.
 *
 * @param {Object} feedbackData - The feedback submission
 * @param {string} feedbackData.text - The main feedback text
 * @param {string} feedbackData.category - Category of feedback
 * @param {string} feedbackData.mood - Employee mood selection
 * @returns {Promise<Object>} AI analysis result
 */
const analyzeFeedback = async ({ text, category, mood }) => {
  // ─── System Prompt ─────────────────────────────────────────────────────────
  const systemPrompt = `You are an expert HR analyst specializing in employee wellbeing and workplace sentiment analysis. 
Your role is to analyze employee feedback and return structured insights in JSON format.
Always respond with valid JSON only — no markdown, no explanation, just the JSON object.`;

  // ─── User Prompt ───────────────────────────────────────────────────────────
  const userPrompt = `Analyze this employee feedback submission and return a JSON object with exactly these fields:

Feedback details:
- Category: ${category}
- Mood: ${mood} (scale: very_happy → happy → neutral → unhappy → very_unhappy)
- Text: "${text}"

Return this exact JSON structure:
{
  "sentimentScore": <number between -1.0 (most negative) and 1.0 (most positive), two decimal places>,
  "themes": <array of 1-3 lowercase theme tags from: workload, management, culture, compensation, work_life_balance, career_growth, team_dynamics, communication, recognition, tools_resources, safety, other>,
  "isUrgent": <boolean — true ONLY if content suggests harassment, bullying, discrimination, serious mental health crisis, physical safety concern, or imminent resignation due to hostile conditions>,
  "urgentReason": <string if isUrgent is true, one of: harassment, bullying, discrimination, burnout_crisis, safety_concern, mental_health_crisis, resignation_risk; null otherwise>,
  "aiSummary": <concise 1-2 sentence summary of the key concern or sentiment, written neutrally for a manager to read, max 150 chars>
}`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 500,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    });

    // Extract text from the response
    const rawText = response.content[0].text.trim();

    // Parse and validate the JSON response
    const result = JSON.parse(rawText);

    // ─── Validate and sanitize the response fields ──────────────────────────
    return {
      sentimentScore: clamp(parseFloat(result.sentimentScore) || 0, -1, 1),
      themes: Array.isArray(result.themes) ? result.themes.slice(0, 3) : [],
      isUrgent: Boolean(result.isUrgent),
      urgentReason: result.isUrgent ? (result.urgentReason || null) : null,
      aiSummary: String(result.aiSummary || '').substring(0, 300),
    };
  } catch (error) {
    logger.error(`[aiService] Failed to analyze feedback: ${error.message}`);

    // ─── Fallback: return neutral defaults so submission doesn't fail ───────
    return {
      sentimentScore: 0,
      themes: [category.toLowerCase().replace(/\s+/g, '_')],
      isUrgent: false,
      urgentReason: null,
      aiSummary: 'AI analysis unavailable. Manual review recommended.',
    };
  }
};

/**
 * Utility: Clamp a number between min and max.
 */
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

module.exports = { analyzeFeedback };
