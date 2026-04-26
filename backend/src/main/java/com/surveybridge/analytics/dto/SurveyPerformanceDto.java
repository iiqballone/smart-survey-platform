package com.surveybridge.analytics.dto;

import com.surveybridge.survey.entity.SurveyStatus;

import java.util.UUID;

public record SurveyPerformanceDto(
    UUID id,
    String title,
    int received,
    int target,
    double completionRate,
    int nps,
    SurveyStatus status
) {}
