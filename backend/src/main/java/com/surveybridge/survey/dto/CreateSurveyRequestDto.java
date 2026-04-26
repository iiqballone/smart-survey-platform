package com.surveybridge.survey.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public record CreateSurveyRequestDto(
    @NotBlank @Size(min = 3, max = 500) String title,
    @NotBlank @Size(min = 10) String description,
    @NotNull @Valid TargetingDto targeting,
    @NotEmpty @Valid List<CreateQuestionDto> questions
) {}
