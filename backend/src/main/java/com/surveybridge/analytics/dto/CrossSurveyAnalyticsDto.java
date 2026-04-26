package com.surveybridge.analytics.dto;

import com.surveybridge.dashboard.dto.TimeSeriesPointDto;

import java.util.List;

public record CrossSurveyAnalyticsDto(
    List<TimeSeriesPointDto> responseTrend,
    List<DemographicItemDto> byCountry,
    List<DemographicItemDto> byAgeGroup,
    List<SurveyPerformanceDto> surveyPerformance
) {}
