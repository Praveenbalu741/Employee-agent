package com.employee.feedback.controller;

import com.employee.feedback.config.UserPrincipal;
import com.employee.feedback.dto.FeedbackResponse;
import com.employee.feedback.dto.OverviewStatsDto;
import com.employee.feedback.dto.SentimentTrendDto;
import com.employee.feedback.dto.ThemeCountDto;
import com.employee.feedback.service.DashboardService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("hasRole('ROLE_MANAGER')")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/sentiment-trends")
    public ResponseEntity<?> getSentimentTrends(
            @RequestParam(required = false) Long teamId,
            @RequestParam(defaultValue = "day") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @AuthenticationPrincipal UserPrincipal principal) {

        Long resolvedTeamId = teamId;
        if (principal != null && "manager".equalsIgnoreCase(principal.getRole())) {
            resolvedTeamId = principal.getTeamId();
        }

        List<SentimentTrendDto> trends = dashboardService.getSentimentTrends(
                resolvedTeamId, period, startDate, endDate
        );

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", trends);
        body.put("period", period);

        return ResponseEntity.ok(body);
    }

    @GetMapping("/themes")
    public ResponseEntity<?> getThemes(
            @RequestParam(required = false) Long teamId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @AuthenticationPrincipal UserPrincipal principal) {

        Long resolvedTeamId = teamId;
        if (principal != null && "manager".equalsIgnoreCase(principal.getRole())) {
            resolvedTeamId = principal.getTeamId();
        }

        List<ThemeCountDto> themes = dashboardService.getThemes(resolvedTeamId, startDate, endDate);

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", themes);

        return ResponseEntity.ok(body);
    }

    @GetMapping("/urgent")
    public ResponseEntity<?> getUrgent(
            @RequestParam(required = false) Long teamId,
            @AuthenticationPrincipal UserPrincipal principal) {

        Long resolvedTeamId = teamId;
        if (principal != null && "manager".equalsIgnoreCase(principal.getRole())) {
            resolvedTeamId = principal.getTeamId();
        }

        List<FeedbackResponse> urgent = dashboardService.getUrgentFlags(resolvedTeamId);

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", urgent);
        body.put("total", urgent.size());

        return ResponseEntity.ok(body);
    }

    @GetMapping("/overview")
    public ResponseEntity<?> getOverview(
            @RequestParam(required = false) Long teamId,
            @AuthenticationPrincipal UserPrincipal principal) {

        Long resolvedTeamId = teamId;
        if (principal != null && "manager".equalsIgnoreCase(principal.getRole())) {
            resolvedTeamId = principal.getTeamId();
        }

        OverviewStatsDto overview = dashboardService.getOverview(resolvedTeamId);

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", overview);

        return ResponseEntity.ok(body);
    }
}
