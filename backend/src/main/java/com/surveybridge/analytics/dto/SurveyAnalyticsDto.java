package com.surveybridge.analytics.dto;

import com.surveybridge.dashboard.dto.TimeSeriesPointDto;

import java.util.List;
import java.util.UUID;

public record SurveyAnalyticsDto(
    UUID surveyId,
    int completedCount,
    int screenoutCount,
    int completesRequired,
    double completionRate,
    double screenoutRate,
    Double averageCpi,
    List<TimeSeriesPointDto> trend
) {}
