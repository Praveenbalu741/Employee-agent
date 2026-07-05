package com.employee.feedback.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class OverviewStatsDto {
    private Long totalFeedback;
    private Long urgentUnresolved;
    private String avgSentiment;
    private List<MoodCount> moodDistribution;

    public OverviewStatsDto() {}

    public OverviewStatsDto(Long totalFeedback, Long urgentUnresolved, String avgSentiment, List<MoodCount> moodDistribution) {
        this.totalFeedback = totalFeedback;
        this.urgentUnresolved = urgentUnresolved;
        this.avgSentiment = avgSentiment;
        this.moodDistribution = moodDistribution;
    }

    public Long getTotalFeedback() {
        return totalFeedback;
    }

    public void setTotalFeedback(Long totalFeedback) {
        this.totalFeedback = totalFeedback;
    }

    public Long getUrgentUnresolved() {
        return urgentUnresolved;
    }

    public void setUrgentUnresolved(Long urgentUnresolved) {
        this.urgentUnresolved = urgentUnresolved;
    }

    public String getAvgSentiment() {
        return avgSentiment;
    }

    public void setAvgSentiment(String avgSentiment) {
        this.avgSentiment = avgSentiment;
    }

    public List<MoodCount> getMoodDistribution() {
        return moodDistribution;
    }

    public void setMoodDistribution(List<MoodCount> moodDistribution) {
        this.moodDistribution = moodDistribution;
    }

    public static class MoodCount {
        private String mood;
        private Long count;

        public MoodCount() {}

        public MoodCount(String mood, Long count) {
            this.mood = mood;
            this.count = count;
        }

        @JsonProperty("_id")
        public String getMood() {
            return mood;
        }

        public void setMood(String mood) {
            this.mood = mood;
        }

        public Long getCount() {
            return count;
        }

        public void setCount(Long count) {
            this.count = count;
        }
    }
}
