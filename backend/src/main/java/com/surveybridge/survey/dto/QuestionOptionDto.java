package com.surveybridge.survey.dto;

import java.util.UUID;

public record QuestionOptionDto(
    UUID id,
    int orderIndex,
    String label,
    String value
) {}
