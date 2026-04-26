package com.surveybridge.analytics.dto;

import java.util.List;
import java.util.UUID;

public record SurveyAnalyticsDto(
    UUID surveyId,
    NpsBreakdownDto nps,
    double avgDurationSeconds,
    DemographicsDto demographics,
    List<QuestionInsightDto> questionInsights
) {}
