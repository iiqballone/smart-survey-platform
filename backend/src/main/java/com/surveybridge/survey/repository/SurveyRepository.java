package com.surveybridge.survey.repository;

import com.surveybridge.survey.entity.Survey;
import com.surveybridge.survey.entity.SurveyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface SurveyRepository extends JpaRepository<Survey, UUID> {
    Optional<Survey> findByIdAndClientId(UUID id, UUID clientId);
    Optional<Survey> findByFusionSurveyId(String fusionSurveyId);
    Page<Survey> findAllByClientId(UUID clientId, Pageable pageable);
    Page<Survey> findAllByClientIdAndStatus(UUID clientId, SurveyStatus status, Pageable pageable);
    long countByClientId(UUID clientId);
    long countByClientIdAndStatus(UUID clientId, SurveyStatus status);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Survey s SET s.completedCount = s.completedCount + 1 WHERE s.id = :id")
    void incrementCompletedCount(@Param("id") UUID id);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Survey s SET s.screenoutCount = s.screenoutCount + 1 WHERE s.id = :id")
    void incrementScreenoutCount(@Param("id") UUID id);
}
