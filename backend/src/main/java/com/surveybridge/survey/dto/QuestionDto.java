package com.surveybridge.survey.dto;

import com.surveybridge.survey.entity.QuestionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record QuestionDto(
    UUID id,
    int orderIndex,
    @NotBlank String text,
    @NotNull QuestionType type,
    boolean required,
    String conditionalLogic,
    List<QuestionOptionDto> options
) {}
