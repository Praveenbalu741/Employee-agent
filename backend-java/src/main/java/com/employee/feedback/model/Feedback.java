package com.employee.feedback.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "feedback", indexes = {
    @Index(name = "idx_feedback_team_created", columnList = "team_id, created_at"),
    @Index(name = "idx_feedback_urgent_status", columnList = "is_urgent, status")
})
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id")
    private Long employeeId; // null if anonymous

    @Column(name = "team_id")
    private Long teamId;

    @NotBlank
    @Column(nullable = false)
    private String category;

    @NotBlank
    @Size(max = 5000)
    @Column(nullable = false, length = 5000)
    private String text;

    @NotBlank
    @Column(nullable = false)
    private String mood; // "very_happy", "happy", "neutral", "unhappy", "very_unhappy"

    @Column(name = "is_anonymous", nullable = false)
    private boolean isAnonymous = false;

    // AI-processed fields
    @Column(name = "sentiment_score")
    private Double sentimentScore;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "feedback_themes", joinColumns = @JoinColumn(name = "feedback_id"))
    @Column(name = "theme")
    private List<String> themes = new ArrayList<>();

    @Column(name = "is_urgent", nullable = false)
    private boolean isUrgent = false;

    @Column(name = "urgent_reason")
    private String urgentReason;

    @Column(name = "ai_summary", length = 300)
    private String aiSummary;

    @Column(name = "ai_processed", nullable = false)
    private boolean aiProcessed = false;

    @NotBlank
    @Column(nullable = false)
    private String status = "open"; // "open", "reviewed", "resolved"

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Feedback() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
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
}
