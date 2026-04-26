package com.surveybridge.analytics.dto;

public record NpsBreakdownDto(
    int score,
    double promotersPct,
    double passivesPct,
    double detractorsPct
) {}
