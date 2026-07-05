package com.employee.feedback.service;

import com.employee.feedback.dto.FeedbackResponse;
import com.employee.feedback.dto.FeedbackSubmitRequest;
import com.employee.feedback.model.Feedback;
import com.employee.feedback.model.Team;
import com.employee.feedback.model.User;
import com.employee.feedback.repository.FeedbackRepository;
import com.employee.feedback.repository.TeamRepository;
import com.employee.feedback.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class FeedbackService {

    private static final Logger logger = LoggerFactory.getLogger(FeedbackService.class);

    private final FeedbackRepository feedbackRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final AiService aiService;
    private final EmailService emailService;

    public FeedbackService(
            FeedbackRepository feedbackRepository,
            TeamRepository teamRepository,
            UserRepository userRepository,
            AiService aiService,
            EmailService emailService) {
        this.feedbackRepository = feedbackRepository;
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
        this.aiService = aiService;
        this.emailService = emailService;
    }

    @Transactional
    public FeedbackResponse submitFeedback(FeedbackSubmitRequest request, Long authenticatedUserId, Long authenticatedUserTeamId) {
        Feedback feedback = new Feedback();
        feedback.setCategory(request.getCategory());
        feedback.setText(request.getText());
        feedback.setMood(request.getMood());
        feedback.setAnonymous(request.isAnonymous());
        
        // Resolve team and employee references
        feedback.setEmployeeId(request.isAnonymous() ? null : authenticatedUserId);
        
        Long teamId = request.getTeamId() != null ? request.getTeamId() : authenticatedUserTeamId;
        feedback.setTeamId(teamId);
        feedback.setStatus("open");

        Feedback savedFeedback = feedbackRepository.save(feedback);

        // Async non-blocking execution of AI analysis
        CompletableFuture.runAsync(() -> {
            try {
                processWithAI(savedFeedback.getId(), teamId);
            } catch (Exception e) {
                logger.error("[feedbackService] AI processing async failure for feedback ID {}: {}", savedFeedback.getId(), e.getMessage());
            }
        });

        return mapToResponse(savedFeedback);
    }

    private void processWithAI(Long feedbackId, Long teamId) {
        Feedback feedback = feedbackRepository.findById(feedbackId).orElse(null);
        if (feedback == null) return;

        AiService.AiAnalysisResult analysis = aiService.analyzeFeedback(
                feedback.getText(), feedback.getCategory(), feedback.getMood()
        );

        feedback.setSentimentScore(analysis.getSentimentScore());
        feedback.setThemes(analysis.getThemes());
        feedback.setUrgent(analysis.isUrgent());
        feedback.setUrgentReason(analysis.getUrgentReason());
        feedback.setAiSummary(analysis.getAiSummary());
        feedback.setAiProcessed(true);

        feedbackRepository.save(feedback);
        logger.info("[AI] Feedback ID {} parsed. Urgent: {}", feedbackId, analysis.isUrgent());

        // Alert manager if urgent flag is raised
        if (analysis.isUrgent() && teamId != null) {
            triggerUrgentAlert(feedback, teamId);
        }
    }

    private void triggerUrgentAlert(Feedback feedback, Long teamId) {
        try {
            Team team = teamRepository.findById(teamId).orElse(null);
            if (team == null || team.getManagerId() == null) return;

            User manager = userRepository.findById(team.getManagerId()).orElse(null);
            if (manager == null) return;

            emailService.sendUrgentAlert(manager.getEmail(), manager.getName(), feedback);
        } catch (Exception e) {
            logger.error("[Alert] Failed to process urgent alert: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<FeedbackResponse> listFeedback(
            Long teamId, String status, Boolean isUrgent, String category,
            LocalDateTime startDate, LocalDateTime endDate, int page, int limit) {

        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<Feedback> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (teamId != null) {
                predicates.add(cb.equal(root.get("teamId"), teamId));
            }
            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (isUrgent != null) {
                predicates.add(cb.equal(root.get("isUrgent"), isUrgent));
            }
            if (category != null && !category.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Feedback> feedbackPage = feedbackRepository.findAll(spec, pageable);
        return feedbackPage.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public FeedbackResponse getFeedback(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Feedback not found."));
        return mapToResponse(feedback);
    }

    @Transactional
    public FeedbackResponse updateFeedbackStatus(Long id, String status) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Feedback not found."));
        
        feedback.setStatus(status);
        Feedback saved = feedbackRepository.save(feedback);
        return mapToResponse(saved);
    }

    public FeedbackResponse mapToResponse(Feedback f) {
        FeedbackResponse res = new FeedbackResponse();
        res.setId(f.getId());
        res.setCategory(f.getCategory());
        res.setText(f.getText());
        res.setMood(f.getMood());
        res.setAnonymous(f.isAnonymous());
        res.setSentimentScore(f.getSentimentScore());
        res.setThemes(f.getThemes());
        res.setUrgent(f.isUrgent());
        res.setUrgentReason(f.getUrgentReason());
        res.setAiSummary(f.getAiSummary());
        res.setAiProcessed(f.isAiProcessed());
        res.setStatus(f.getStatus());
        res.setCreatedAt(f.getCreatedAt());
        res.setUpdatedAt(f.getUpdatedAt());

        if (f.getTeamId() != null) {
            teamRepository.findById(f.getTeamId()).ifPresent(t -> {
                res.setTeamId(new FeedbackResponse.TeamInfo(t.getId(), t.getName()));
            });
        }

        if (!f.isAnonymous() && f.getEmployeeId() != null) {
            userRepository.findById(f.getEmployeeId()).ifPresent(u -> {
                res.setEmployeeId(new FeedbackResponse.EmployeeInfo(u.getId(), u.getName(), u.getEmail()));
            });
        }

        return res;
    }
}
