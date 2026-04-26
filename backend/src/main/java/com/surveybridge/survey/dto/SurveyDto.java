package com.surveybridge.survey.dto;

import com.surveybridge.survey.entity.SurveyStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record SurveyDto(
    UUID id,
    UUID clientId,
    String title,
    String surveyUrl,
    String fusionSurveyId,
    String fusionEntryUrl,
    String country,
    int completesRequired,
    int completedCount,
    int screenoutCount,
    int loi,
    BigDecimal cpiMin,
    BigDecimal cpiMax,
    String callbackUrl,
    SurveyStatus status,
    LocalDateTime createdAt,
    LocalDateTime publishedAt,
    LocalDateTime closedAt
) {}
