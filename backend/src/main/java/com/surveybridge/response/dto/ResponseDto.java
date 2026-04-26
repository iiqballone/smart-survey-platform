package com.surveybridge.response.dto;

import com.surveybridge.response.entity.EventType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record ResponseDto(
    UUID id,
    UUID surveyId,
    String respondentId,
    String fusionSurveyId,
    EventType eventType,
    BigDecimal cpi,
    LocalDateTime occurredAt
) {}
