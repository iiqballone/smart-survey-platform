package com.surveybridge.dashboard.dto;

public record TimeSeriesPointDto(
    String date,
    long responses,
    long completions
) {}
