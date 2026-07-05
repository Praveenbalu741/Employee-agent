package com.employee.feedback.service;

import com.employee.feedback.dto.FeedbackResponse;
import com.employee.feedback.dto.OverviewStatsDto;
import com.employee.feedback.dto.SentimentTrendDto;
import com.employee.feedback.dto.ThemeCountDto;
import com.employee.feedback.model.Feedback;
import com.employee.feedback.repository.FeedbackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final FeedbackRepository feedbackRepository;
    private final FeedbackService feedbackService;

    public DashboardService(FeedbackRepository feedbackRepository, FeedbackService feedbackService) {
        this.feedbackRepository = feedbackRepository;
        this.feedbackService = feedbackService;
    }

    @Transactional(readOnly = true)
    public OverviewStatsDto getOverview(Long teamId) {
        long totalFeedback;
        long urgentUnresolved;
        Double avgSentimentScore;
        List<Object[]> moodCountsRaw;

        if (teamId != null) {
            totalFeedback = feedbackRepository.countByTeamId(teamId);
            urgentUnresolved = feedbackRepository.countByTeamIdAndIsUrgentAndStatusNot(teamId, true, "resolved");
            avgSentimentScore = feedbackRepository.getAverageSentimentScore(teamId);
            moodCountsRaw = feedbackRepository.getMoodDistribution(teamId);
        } else {
            totalFeedback = feedbackRepository.count();
            urgentUnresolved = feedbackRepository.findByIsUrgentAndStatusNot(true, "resolved").size();
            avgSentimentScore = feedbackRepository.getAverageSentimentScore(null);
            moodCountsRaw = feedbackRepository.getMoodDistribution(null);
        }

        String avgSentiment = avgSentimentScore != null ? String.format(Locale.US, "%.2f", avgSentimentScore) : "0.00";

        List<OverviewStatsDto.MoodCount> moodDistribution = moodCountsRaw.stream()
                .map(row -> new OverviewStatsDto.MoodCount((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());

        return new OverviewStatsDto(totalFeedback, urgentUnresolved, avgSentiment, moodDistribution);
    }

    @Transactional(readOnly = true)
    public List<SentimentTrendDto> getSentimentTrends(Long teamId, String period, LocalDateTime start, LocalDateTime end) {
        // Fetch feedbacks
        List<Feedback> feedbacks;
        if (teamId != null) {
            feedbacks = feedbackRepository.findAll().stream()
                    .filter(f -> teamId.equals(f.getTeamId()) && f.isAiProcessed())
                    .collect(Collectors.toList());
        } else {
            feedbacks = feedbackRepository.findAll().stream()
                    .filter(Feedback::isAiProcessed)
                    .collect(Collectors.toList());
        }

        // Filter by date if provided
        if (start != null) {
            feedbacks = feedbacks.stream().filter(f -> f.getCreatedAt().isAfter(start)).collect(Collectors.toList());
        }
        if (end != null) {
            feedbacks = feedbacks.stream().filter(f -> f.getCreatedAt().isBefore(end)).collect(Collectors.toList());
        }

        // Group programmatically to maintain complete database dialect portability (H2 vs Postgres vs MySQL)
        Map<String, List<Feedback>> grouped = new HashMap<>();
        WeekFields weekFields = WeekFields.of(Locale.getDefault());

        for (Feedback f : feedbacks) {
            LocalDateTime date = f.getCreatedAt();
            String key;
            if ("month".equalsIgnoreCase(period)) {
                key = String.format("%d-M%02d", date.getYear(), date.getMonthValue());
            } else if ("week".equalsIgnoreCase(period)) {
                int weekNum = date.get(weekFields.weekOfWeekBasedYear());
                key = String.format("%d-W%02d", date.getYear(), weekNum);
            } else { // default: day
                key = String.format("%d-D%02d-%02d", date.getYear(), date.getMonthValue(), date.getDayOfMonth());
            }

            grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(f);
        }

        List<SentimentTrendDto> trendsList = new ArrayList<>();
        for (Map.Entry<String, List<Feedback>> entry : grouped.entrySet()) {
            String groupKey = entry.getKey();
            List<Feedback> list = entry.getValue();

            double avgSentiment = list.stream()
                    .filter(f -> f.getSentimentScore() != null)
                    .mapToDouble(Feedback::getSentimentScore)
                    .average()
                    .orElse(0.0);

            long count = list.size();
            long urgentCount = list.stream().filter(Feedback::isUrgent).count();

            // Build aggregated Mongo-like _id representation
            Map<String, Integer> idMap = new HashMap<>();
            String[] parts = groupKey.split("-");
            idMap.put("year", Integer.parseInt(parts[0]));
            if ("month".equalsIgnoreCase(period)) {
                idMap.put("month", Integer.parseInt(parts[1].substring(1)));
            } else if ("week".equalsIgnoreCase(period)) {
                idMap.put("week", Integer.parseInt(parts[1].substring(1)));
            } else {
                idMap.put("month", Integer.parseInt(parts[1].substring(1)));
                idMap.put("day", Integer.parseInt(parts[2]));
            }

            trendsList.add(new SentimentTrendDto(idMap, avgSentiment, count, urgentCount));
        }

        // Sort by year, month, day, week ascending
        trendsList.sort((t1, t2) -> {
            Map<String, Integer> id1 = t1.getIdMap();
            Map<String, Integer> id2 = t2.getIdMap();

            int cmp = id1.get("year").compareTo(id2.get("year"));
            if (cmp != 0) return cmp;

            if (id1.containsKey("month") && id2.containsKey("month")) {
                cmp = id1.get("month").compareTo(id2.get("month"));
                if (cmp != 0) return cmp;
            }

            if (id1.containsKey("day") && id2.containsKey("day")) {
                cmp = id1.get("day").compareTo(id2.get("day"));
                if (cmp != 0) return cmp;
            }

            if (id1.containsKey("week") && id2.containsKey("week")) {
                cmp = id1.get("week").compareTo(id2.get("week"));
                if (cmp != 0) return cmp;
            }

            return 0;
        });

        return trendsList;
    }

    @Transactional(readOnly = true)
    public List<ThemeCountDto> getThemes(Long teamId, LocalDateTime start, LocalDateTime end) {
        List<Feedback> feedbacks;
        if (teamId != null) {
            feedbacks = feedbackRepository.findAll().stream()
                    .filter(f -> teamId.equals(f.getTeamId()) && f.isAiProcessed())
                    .collect(Collectors.toList());
        } else {
            feedbacks = feedbackRepository.findAll().stream()
                    .filter(Feedback::isAiProcessed)
                    .collect(Collectors.toList());
        }

        if (start != null) {
            feedbacks = feedbacks.stream().filter(f -> f.getCreatedAt().isAfter(start)).collect(Collectors.toList());
        }
        if (end != null) {
            feedbacks = feedbacks.stream().filter(f -> f.getCreatedAt().isBefore(end)).collect(Collectors.toList());
        }

        Map<String, Long> themeCounts = feedbacks.stream()
                .flatMap(f -> f.getThemes().stream())
                .collect(Collectors.groupingBy(theme -> theme, Collectors.counting()));

        return themeCounts.entrySet().stream()
                .map(entry -> new ThemeCountDto(entry.getKey(), entry.getValue()))
                .sorted((t1, t2) -> t2.getCount().compareTo(t1.getCount()))
                .limit(20)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> getUrgentFlags(Long teamId) {
        List<Feedback> urgentFeedbacks;
        if (teamId != null) {
            urgentFeedbacks = feedbackRepository.findByIsUrgentAndStatusNotAndTeamId(true, "resolved", teamId);
        } else {
            urgentFeedbacks = feedbackRepository.findByIsUrgentAndStatusNot(true, "resolved");
        }

        return urgentFeedbacks.stream()
                .sorted(Comparator.comparing(Feedback::getCreatedAt).reversed())
                .limit(50)
                .map(feedbackService::mapToResponse)
                .collect(Collectors.toList());
    }
}
