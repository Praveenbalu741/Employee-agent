package com.employee.feedback.controller;

import com.employee.feedback.config.UserPrincipal;
import com.employee.feedback.dto.FeedbackResponse;
import com.employee.feedback.dto.FeedbackSubmitRequest;
import com.employee.feedback.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public ResponseEntity<?> submitFeedback(
            @Valid @RequestBody FeedbackSubmitRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        
        Long userId = principal != null ? principal.getId() : null;
        Long userTeamId = principal != null ? principal.getTeamId() : null;

        FeedbackResponse response = feedbackService.submitFeedback(request, userId, userTeamId);

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Feedback submitted successfully.");
        
        Map<String, Object> innerFeedback = new HashMap<>();
        innerFeedback.put("id", response.getId());
        innerFeedback.put("_id", response.getId());
        innerFeedback.put("category", response.getCategory());
        innerFeedback.put("mood", response.getMood());
        innerFeedback.put("isAnonymous", response.isAnonymous());
        innerFeedback.put("createdAt", response.getCreatedAt());
        
        body.put("feedback", innerFeedback);

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<?> listFeedback(
            @RequestParam(required = false) Long teamId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean isUrgent,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @AuthenticationPrincipal UserPrincipal principal) {

        Long resolvedTeamId = teamId;
        // Managers see only their team's feedback
        if (principal != null && "manager".equalsIgnoreCase(principal.getRole())) {
            resolvedTeamId = principal.getTeamId();
        }

        Page<FeedbackResponse> feedbackPage = feedbackService.listFeedback(
                resolvedTeamId, status, isUrgent, category, startDate, endDate, page, limit
        );

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", feedbackPage.getContent());

        Map<String, Object> pagination = new HashMap<>();
        pagination.put("total", feedbackPage.getTotalElements());
        pagination.put("page", page);
        pagination.put("limit", limit);
        pagination.put("pages", feedbackPage.getTotalPages());
        body.put("pagination", pagination);

        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<?> getFeedback(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        try {
            FeedbackResponse feedback = feedbackService.getFeedback(id);
            
            // Authorization check: Make sure manager belongs to the team of the feedback
            if (principal != null && "manager".equalsIgnoreCase(principal.getRole())) {
                FeedbackResponse.TeamInfo teamInfo = feedback.getTeamId();
                if (teamInfo != null && (principal.getTeamId() == null || !principal.getTeamId().equals(teamInfo.getId()))) {
                    Map<String, Object> error = new HashMap<>();
                    error.put("success", false);
                    error.put("message", "Access denied. Managers can only view feedback for their own team.");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
                }
            }

            Map<String, Object> body = new HashMap<>();
            body.put("success", true);
            body.put("data", feedback);
            return ResponseEntity.ok(body);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<?> updateFeedback(
            @PathVariable Long id,
            @RequestBody Map<String, String> requestBody,
            @AuthenticationPrincipal UserPrincipal principal) {
        
        String status = requestBody.get("status");
        if (status == null || status.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Status is required.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        try {
            FeedbackResponse response = feedbackService.updateFeedbackStatus(id, status);
            Map<String, Object> body = new HashMap<>();
            body.put("success", true);
            body.put("data", response);
            return ResponseEntity.ok(body);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}
