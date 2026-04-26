package com.surveybridge.response.repository;

import com.surveybridge.response.entity.EventType;
import com.surveybridge.response.entity.SurveyResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface SurveyResponseRepository extends JpaRepository<SurveyResponse, UUID> {

    Page<SurveyResponse> findBySurveyId(UUID surveyId, Pageable pageable);

    Page<SurveyResponse> findBySurveyIdAndOccurredAtBetween(
        UUID surveyId, LocalDateTime from, LocalDateTime to, Pageable pageable);

    Page<SurveyResponse> findBySurveyIdAndEventType(UUID surveyId, EventType eventType, Pageable pageable);

    List<SurveyResponse> findBySurveyId(UUID surveyId);

    long countBySurveyId(UUID surveyId);

    long countBySurveyIdAndEventType(UUID surveyId, EventType eventType);

    @Query("SELECT COUNT(r) FROM SurveyResponse r WHERE r.surveyId IN " +
           "(SELECT s.id FROM Survey s WHERE s.clientId = :clientId)")
    long countByClientId(@Param("clientId") UUID clientId);

    @Query("SELECT COUNT(r) FROM SurveyResponse r WHERE r.surveyId IN " +
           "(SELECT s.id FROM Survey s WHERE s.clientId = :clientId) AND r.occurredAt >= :since")
    long countByClientIdSince(@Param("clientId") UUID clientId, @Param("since") LocalDateTime since);

    @Query(value = """
        SELECT TO_CHAR(DATE_TRUNC(:granularity, occurred_at), 'YYYY-MM-DD') AS period,
               COUNT(*) AS responses,
               SUM(CASE WHEN event_type = 'COMPLETE' THEN 1 ELSE 0 END) AS completions
        FROM survey_responses
        WHERE survey_id = :surveyId AND occurred_at BETWEEN :from AND :to
        GROUP BY DATE_TRUNC(:granularity, occurred_at)
        ORDER BY 1
        """, nativeQuery = true)
    List<Object[]> findTimeseries(
        @Param("surveyId") UUID surveyId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to,
        @Param("granularity") String granularity);

    @Query("SELECT AVG(r.cpi) FROM SurveyResponse r WHERE r.surveyId = :surveyId AND r.eventType = 'COMPLETE'")
    Double findAvgCpiBySurveyId(@Param("surveyId") UUID surveyId);
}
