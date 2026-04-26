package com.surveybridge.dashboard.dto;

import java.util.UUID;

public record CompletionRateDto(
    UUID surveyId,
    String title,
    double completionRate,
    int completedCount,
    int completesRequired
) {}
