package com.employee.feedback.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "settings")
public class Settings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "team_id", nullable = false, unique = true)
    private Long teamId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "settings_categories", joinColumns = @JoinColumn(name = "settings_id"))
    @Column(name = "category")
    private List<String> feedbackCategories = new ArrayList<>();

    @Column(name = "anonymity_default", nullable = false)
    private boolean anonymityDefault = false;

    // Notification Preferences
    @Column(name = "urgent_email", nullable = false)
    private boolean urgentEmail = true;

    @Column(name = "weekly_digest", nullable = false)
    private boolean weeklyDigest = true;

    @Column(name = "webhook_url")
    private String webhookUrl;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "settings_urgent_keywords", joinColumns = @JoinColumn(name = "settings_id"))
    @Column(name = "keyword")
    private List<String> urgentKeywords = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        
        // Populate default feedback categories if empty
        if (feedbackCategories.isEmpty()) {
            feedbackCategories.addAll(List.of("Workload", "Management", "Culture", "Compensation", "Work-Life Balance", "Career Growth", "Other"));
        }
        // Populate default urgent keywords if empty
        if (urgentKeywords.isEmpty()) {
            urgentKeywords.addAll(List.of("harassment", "burnout", "toxic", "quit", "unsafe", "discrimination", "mental health", "anxiety", "depression"));
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Settings() {}

    public Settings(Long teamId) {
        this.teamId = teamId;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTeamId() {
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

    public boolean isAnonymityDefault() {
        return anonymityDefault;
    }

    public void setAnonymityDefault(boolean anonymityDefault) {
        this.anonymityDefault = anonymityDefault;
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

    public List<String> getUrgentKeywords() {
        return urgentKeywords;
    }

    public void setUrgentKeywords(List<String> urgentKeywords) {
        this.urgentKeywords = urgentKeywords;
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
}
