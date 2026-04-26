package com.surveybridge.response.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "survey_responses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveyResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "survey_id", nullable = false)
    private UUID surveyId;

    @Column(name = "respondent_id")
    private String respondentId;

    @Column(name = "fusion_survey_id")
    private String fusionSurveyId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private EventType eventType;

    @Column(precision = 10, scale = 2)
    private BigDecimal cpi;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;
}
