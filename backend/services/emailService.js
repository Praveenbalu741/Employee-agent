/**
 * services/emailService.js — Nodemailer email notification service
 *
 * Sends urgent feedback alerts and weekly digest emails to managers.
 * Configure SMTP settings in .env — stub SMTP (Mailtrap) works for dev.
 */

const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// ─── Create transporter ───────────────────────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Sends an urgent feedback alert email to a manager.
 *
 * @param {Object} options
 * @param {string} options.managerEmail - Recipient email
 * @param {string} options.managerName - Recipient name
 * @param {Object} options.feedback - The urgent feedback object
 */
const sendUrgentAlert = async ({ managerEmail, managerName, feedback }) => {
  if (!process.env.SMTP_USER) {
    logger.warn('[emailService] SMTP not configured — skipping urgent alert email.');
    return;
  }

  const transporter = createTransporter();

  const urgentReasonLabel = {
    harassment: '⚠️ Harassment',
    bullying: '⚠️ Bullying',
    discrimination: '⚠️ Discrimination',
    burnout_crisis: '🔥 Burnout Crisis',
    safety_concern: '🚨 Safety Concern',
    mental_health_crisis: '🆘 Mental Health Crisis',
    resignation_risk: '🚪 Resignation Risk',
  };

  const subject = `🚨 Urgent Feedback Alert — ${urgentReasonLabel[feedback.urgentReason] || 'Action Required'}`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0F1420; padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #F4A261; margin: 0; font-size: 20px;">Employee Feedback Agent</h1>
        <p style="color: #2EC4B6; margin: 4px 0 0;">Urgent Alert Notification</p>
      </div>
      <div style="background: #1a2035; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #2a3550;">
        <p style="color: #e0e0e0;">Hi <strong>${managerName}</strong>,</p>
        <p style="color: #e0e0e0;">An urgent feedback item requires your immediate attention:</p>
        <div style="background: #0F1420; border-left: 4px solid #F4A261; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="color: #F4A261; font-weight: bold; margin: 0 0 8px;">Issue Type: ${urgentReasonLabel[feedback.urgentReason] || feedback.urgentReason}</p>
          <p style="color: #aaa; margin: 0 0 8px;">Category: <span style="color: #2EC4B6;">${feedback.category}</span></p>
          <p style="color: #aaa; margin: 0 0 8px;">Submitted: <span style="color: #fff;">${new Date(feedback.createdAt).toLocaleDateString()}</span></p>
          <p style="color: #aaa; margin: 0;">Anonymized: <span style="color: #fff;">${feedback.isAnonymous ? 'Yes' : 'No'}</span></p>
        </div>
        <div style="background: #0F1420; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="color: #2EC4B6; font-weight: bold; margin: 0 0 8px;">AI Summary:</p>
          <p style="color: #e0e0e0; margin: 0; font-style: italic;">"${feedback.aiSummary}"</p>
        </div>
        <p style="color: #aaa; font-size: 12px; margin-top: 24px;">
          This is an automated alert from your Employee Feedback Agent. Please log in to your dashboard to review and take action.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Employee Feedback Agent" <${process.env.SMTP_FROM || 'noreply@employeefeedback.com'}>`,
      to: managerEmail,
      subject,
      html: htmlBody,
    });
    logger.info(`[emailService] Urgent alert sent to ${managerEmail}`);
  } catch (error) {
    logger.error(`[emailService] Failed to send alert: ${error.message}`);
    // Non-blocking: don't throw — feedback submission should still succeed
  }
};

module.exports = { sendUrgentAlert };
