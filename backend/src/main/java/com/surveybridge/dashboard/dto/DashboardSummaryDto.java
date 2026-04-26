package com.surveybridge.dashboard.dto;

public record DashboardSummaryDto(
    long totalSurveys,
    long activeSurveys,
    long totalResponses,
    double avgCompletionRate,
    long responsesThisMonth
) {}
