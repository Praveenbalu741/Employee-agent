package com.employee.feedback.service;

import com.employee.feedback.model.Feedback;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username:}")
    private String smtpUser;
    
    @Value("${mail.from:noreply@employeefeedback.com}")
    private String fromEmail;

    // Use required = false so that the app loads fine if mail configuration is missing
    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendUrgentAlert(String managerEmail, String managerName, Feedback feedback) {
        if (mailSender == null || smtpUser == null || smtpUser.trim().isEmpty() || smtpUser.equals("your_mailtrap_user")) {
            logger.warn("[emailService] SMTP not configured (or placeholders used) — skipping urgent alert email to {}.", managerEmail);
            return;
        }

        Map<String, String> urgentReasonLabel = Map.of(
            "harassment", "⚠️ Harassment",
            "bullying", "⚠️ Bullying",
            "discrimination", "⚠️ Discrimination",
            "burnout_crisis", "🔥 Burnout Crisis",
            "safety_concern", "🚨 Safety Concern",
            "mental_health_crisis", "🆘 Mental Health Crisis",
            "resignation_risk", "🚪 Resignation Risk"
        );

        String reason = urgentReasonLabel.getOrDefault(feedback.getUrgentReason(), feedback.getUrgentReason());
        String subject = "🚨 Urgent Feedback Alert — " + (reason != null ? reason : "Action Required");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formattedDate = feedback.getCreatedAt() != null ? feedback.getCreatedAt().format(formatter) : "";

        String htmlBody = String.format(
            "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n" +
            "  <div style=\"background: #0F1420; padding: 24px; border-radius: 12px 12px 0 0;\">\n" +
            "    <h1 style=\"color: #F4A261; margin: 0; font-size: 20px;\">Employee Feedback Agent</h1>\n" +
            "    <p style=\"color: #2EC4B6; margin: 4px 0 0;\">Urgent Alert Notification</p>\n" +
            "  </div>\n" +
            "  <div style=\"background: #1a2035; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #2a3550;\">\n" +
            "    <p style=\"color: #e0e0e0;\">Hi <strong>%s</strong>,</p>\n" +
            "    <p style=\"color: #e0e0e0;\">An urgent feedback item requires your immediate attention:</p>\n" +
            "    <div style=\"background: #0F1420; border-left: 4px solid #F4A261; padding: 16px; border-radius: 8px; margin: 16px 0;\">\n" +
            "      <p style=\"color: #F4A261; font-weight: bold; margin: 0 0 8px;\">Issue Type: %s</p>\n" +
            "      <p style=\"color: #aaa; margin: 0 0 8px;\">Category: <span style=\"color: #2EC4B6;\">%s</span></p>\n" +
            "      <p style=\"color: #aaa; margin: 0 0 8px;\">Submitted: <span style=\"color: #fff;\">%s</span></p>\n" +
            "      <p style=\"color: #aaa; margin: 0;\">Anonymized: <span style=\"color: #fff;\">%s</span></p>\n" +
            "    </div>\n" +
            "    <div style=\"background: #0F1420; padding: 16px; border-radius: 8px; margin: 16px 0;\">\n" +
            "      <p style=\"color: #2EC4B6; font-weight: bold; margin: 0 0 8px;\">AI Summary:</p>\n" +
            "      <p style=\"color: #e0e0e0; margin: 0; font-style: italic;\">\"%s\"</p>\n" +
            "    </div>\n" +
            "    <p style=\"color: #aaa; font-size: 12px; margin-top: 24px;\">\n" +
            "      This is an automated alert from your Employee Feedback Agent. Please log in to your dashboard to review and take action.\n" +
            "    </p>\n" +
            "  </div>\n" +
            "</div>",
            managerName,
            reason != null ? reason : feedback.getUrgentReason(),
            feedback.getCategory(),
            formattedDate,
            feedback.isAnonymous() ? "Yes" : "No",
            feedback.getAiSummary()
        );

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(managerEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            logger.info("[emailService] Urgent alert email successfully sent to {}.", managerEmail);
        } catch (Exception e) {
            logger.error("[emailService] Failed to send urgent email alert to {}: {}", managerEmail, e.getMessage());
            // Non-blocking: fail silently to prevent feedback submission crash
        }
    }
}
