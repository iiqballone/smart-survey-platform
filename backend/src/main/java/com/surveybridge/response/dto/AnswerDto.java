package com.surveybridge.response.dto;

import java.util.UUID;

public record AnswerDto(
    UUID questionId,
    String questionText,
    String value
) {}
