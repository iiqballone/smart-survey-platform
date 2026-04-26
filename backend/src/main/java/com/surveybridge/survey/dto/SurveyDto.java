package com.surveybridge.survey.dto;

import com.surveybridge.survey.entity.SurveyStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record SurveyDto(
    UUID id,
    UUID clientId,
    String title,
    String description,
    SurveyStatus status,
    String dynataProjectId,
    TargetingDto targeting,
    int targetResponseCount,
    int receivedResponseCount,
    List<QuestionDto> questions,
    LocalDateTime createdAt,
    LocalDateTime publishedAt,
    LocalDateTime closedAt
) {}
