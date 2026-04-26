package com.surveybridge.survey.dto;

import com.surveybridge.survey.entity.QuestionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateQuestionDto(
    @NotBlank String text,
    @NotNull QuestionType type,
    boolean required,
    List<String> options
) {}
