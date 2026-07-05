package com.employee.feedback.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.HashMap;
import java.util.Map;

public class SentimentTrendDto {
    private Map<String, Integer> idMap = new HashMap<>();
    private Double avgSentiment = 0.0;
    private Long count = 0L;
    private Long urgentCount = 0L;

    public SentimentTrendDto() {}

    public SentimentTrendDto(Map<String, Integer> idMap, Double avgSentiment, Long count, Long urgentCount) {
        this.idMap = idMap;
        this.avgSentiment = avgSentiment;
        this.count = count;
        this.urgentCount = urgentCount;
    }

    @JsonProperty("_id")
    public Map<String, Integer> getIdMap() {
        return idMap;
    }

    public void setIdMap(Map<String, Integer> idMap) {
        this.idMap = idMap;
    }

    public Double getAvgSentiment() {
        return avgSentiment;
    }

    public void setAvgSentiment(Double avgSentiment) {
        this.avgSentiment = avgSentiment;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }

    public Long getUrgentCount() {
        return urgentCount;
    }

    public void setUrgentCount(Long urgentCount) {
        this.urgentCount = urgentCount;
    }
}
