package com.surveybridge.admin.dto;

public record FusionJobDto(
    String fusionSurveyId,
    String surveyTitle,
    String state,
    int completedCount,
    int completesRequired
) {}
