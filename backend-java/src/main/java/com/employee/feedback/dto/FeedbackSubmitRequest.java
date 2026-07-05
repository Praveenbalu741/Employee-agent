package com.employee.feedback.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FeedbackSubmitRequest {

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Feedback text is required")
    @Size(max = 5000, message = "Feedback cannot exceed 5000 characters")
    private String text;

    @NotBlank(message = "Mood is required")
    private String mood;

    private boolean isAnonymous = false;

    private Long teamId;

    public FeedbackSubmitRequest() {}

    // Getters and Setters
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

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }
}
