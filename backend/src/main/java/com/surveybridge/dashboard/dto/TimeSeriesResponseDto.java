package com.surveybridge.dashboard.dto;

import java.util.List;
import java.util.UUID;

public record TimeSeriesResponseDto(
    UUID surveyId,
    List<TimeSeriesPointDto> data
) {}
