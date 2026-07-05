package com.employee.feedback.repository;

import com.employee.feedback.model.Feedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long>, JpaSpecificationExecutor<Feedback> {

    long countByTeamId(Long teamId);

    long countByTeamIdAndIsUrgentAndStatusNot(Long teamId, boolean isUrgent, String status);

    @Query("SELECT AVG(f.sentimentScore) FROM Feedback f WHERE (:teamId IS NULL OR f.teamId = :teamId) AND f.aiProcessed = true")
    Double getAverageSentimentScore(@Param("teamId") Long teamId);

    @Query("SELECT f.mood, COUNT(f) FROM Feedback f WHERE (:teamId IS NULL OR f.teamId = :teamId) GROUP BY f.mood")
    List<Object[]> getMoodDistribution(@Param("teamId") Long teamId);

    List<Feedback> findByIsUrgentAndStatusNotAndTeamId(boolean isUrgent, String status, Long teamId);

    List<Feedback> findByIsUrgentAndStatusNot(boolean isUrgent, String status);
}
