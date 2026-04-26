package com.surveybridge.survey.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateSurveyRequestDto(
    @NotBlank @Size(max = 500) String title,
    @NotBlank String surveyUrl,
    @Positive int completesRequired,
    @Positive int loi,
    @NotBlank @Size(min = 2, max = 2) String country,
    @NotNull @Valid CpiRangeDto cpiRange,
    @NotBlank String callbackUrl
) {}
