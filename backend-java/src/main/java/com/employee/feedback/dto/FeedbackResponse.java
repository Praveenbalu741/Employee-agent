package com.employee.feedback.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;

public class FeedbackResponse {
    private Long id;
    private EmployeeInfo employeeId;
    private TeamInfo teamId;
    private String category;
    private String text;
    private String mood;
    private boolean isAnonymous;
    private Double sentimentScore;
    private List<String> themes;
    private boolean isUrgent;
    private String urgentReason;
    private String aiSummary;
    private boolean aiProcessed;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FeedbackResponse() {}

    public Long getId() {
        return id;
    }

    @JsonProperty("_id")
    public Long getUnderscoreId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public EmployeeInfo getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(EmployeeInfo employeeId) {
        this.employeeId = employeeId;
    }

    public TeamInfo getTeamId() {
        return teamId;
    }

    public void setTeamId(TeamInfo teamId) {
        this.teamId = teamId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getMood() {
        return mood;
    }

    public void setMood(String mood) {
        this.mood = mood;
    }

    @JsonProperty("isAnonymous")
    public boolean isAnonymous() {
        return isAnonymous;
    }

    public void setAnonymous(boolean anonymous) {
        isAnonymous = anonymous;
    }

    public Double getSentimentScore() {
        return sentimentScore;
    }

    public void setSentimentScore(Double sentimentScore) {
        this.sentimentScore = sentimentScore;
    }

    public List<String> getThemes() {
        return themes;
    }

    public void setThemes(List<String> themes) {
        this.themes = themes;
    }

    @JsonProperty("isUrgent")
    public boolean isUrgent() {
        return isUrgent;
    }

    public void setUrgent(boolean urgent) {
        isUrgent = urgent;
    }

    public String getUrgentReason() {
        return urgentReason;
    }

    public void setUrgentReason(String urgentReason) {
        this.urgentReason = urgentReason;
    }

    public String getAiSummary() {
        return aiSummary;
    }

    public void setAiSummary(String aiSummary) {
        this.aiSummary = aiSummary;
    }

    @JsonProperty("aiProcessed")
    public boolean isAiProcessed() {
        return aiProcessed;
    }

    public void setAiProcessed(boolean aiProcessed) {
        this.aiProcessed = aiProcessed;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Inner DTO classes for Mongoose-like population
    public static class EmployeeInfo {
        private Long id;
        private String name;
        private String email;

        public EmployeeInfo() {}

        public EmployeeInfo(Long id, String name, String email) {
            this.id = id;
            this.name = name;
            this.email = email;
        }

        public Long getId() {
            return id;
        }

        @JsonProperty("_id")
        public Long getUnderscoreId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    public static class TeamInfo {
        private Long id;
        private String name;

        public TeamInfo() {}

        public TeamInfo(Long id, String name) {
            this.id = id;
            this.name = name;
        }

        public Long getId() {
            return id;
        }

        @JsonProperty("_id")
        public Long getUnderscoreId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
            this.name = name;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
