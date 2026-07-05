package com.employee.feedback.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class SettingsDto {
    private Long teamId;
    private List<String> feedbackCategories;
    private boolean anonymityDefault;
    private NotificationPreferencesDto notificationPreferences;
    private List<String> urgentKeywords;

    public SettingsDto() {}

    public Long getTeamId() {
        return teamId;
    }

    @JsonProperty("_id")
    public Long getUnderscoreId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public List<String> getFeedbackCategories() {
        return feedbackCategories;
    }

    public void setFeedbackCategories(List<String> feedbackCategories) {
        this.feedbackCategories = feedbackCategories;
    }

    @JsonProperty("anonymityDefault")
    public boolean isAnonymityDefault() {
        return anonymityDefault;
    }

    public void setAnonymityDefault(boolean anonymityDefault) {
        this.anonymityDefault = anonymityDefault;
    }

    public NotificationPreferencesDto getNotificationPreferences() {
        return notificationPreferences;
    }

    public void setNotificationPreferences(NotificationPreferencesDto notificationPreferences) {
        this.notificationPreferences = notificationPreferences;
    }

    public List<String> getUrgentKeywords() {
        return urgentKeywords;
    }

    public void setUrgentKeywords(List<String> urgentKeywords) {
        this.urgentKeywords = urgentKeywords;
    }

    public static class NotificationPreferencesDto {
        private boolean urgentEmail = true;
        private boolean weeklyDigest = true;
        private String webhookUrl;

        public NotificationPreferencesDto() {}

        public NotificationPreferencesDto(boolean urgentEmail, boolean weeklyDigest, String webhookUrl) {
            this.urgentEmail = urgentEmail;
            this.weeklyDigest = weeklyDigest;
            this.webhookUrl = webhookUrl;
        }

        public boolean isUrgentEmail() {
            return urgentEmail;
        }

        public void setUrgentEmail(boolean urgentEmail) {
            this.urgentEmail = urgentEmail;
        }

        public boolean isWeeklyDigest() {
            return weeklyDigest;
        }

        public void setWeeklyDigest(boolean weeklyDigest) {
            this.weeklyDigest = weeklyDigest;
        }

        public String getWebhookUrl() {
            return webhookUrl;
        }

        public void setWebhookUrl(String webhookUrl) {
            this.webhookUrl = webhookUrl;
        }
    }
}
