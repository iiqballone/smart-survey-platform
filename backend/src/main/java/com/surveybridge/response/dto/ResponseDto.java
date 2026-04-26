package com.surveybridge.response.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ResponseDto(
    UUID id,
    UUID surveyId,
    String dynataRespondentId,
    String country,
    int ageGroup,
    String gender,
    LocalDateTime completedAt,
    int durationSeconds,
    List<AnswerDto> answers
) {}
