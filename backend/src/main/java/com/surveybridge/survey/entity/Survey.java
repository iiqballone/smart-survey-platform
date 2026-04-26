package com.surveybridge.survey.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "surveys")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Survey {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "client_id", nullable = false)
    private UUID clientId;

    @Column(nullable = false)
    private String title;

    @Column(name = "survey_url", columnDefinition = "text")
    private String surveyUrl;

    @Column(name = "fusion_survey_id")
    private String fusionSurveyId;

    @Column(name = "fusion_entry_url", columnDefinition = "text")
    private String fusionEntryUrl;

    @Column(length = 10)
    private String country;

    @Column(name = "completes_required")
    private int completesRequired;

    @Column(name = "completed_count")
    private int completedCount;

    @Column(name = "screenout_count")
    private int screenoutCount;

    @Column
    private int loi;

    @Column(name = "cpi_min", precision = 10, scale = 2)
    private BigDecimal cpiMin;

    @Column(name = "cpi_max", precision = 10, scale = 2)
    private BigDecimal cpiMax;

    @Column(name = "callback_url", columnDefinition = "text")
    private String callbackUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SurveyStatus status = SurveyStatus.DRAFT;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;
}
