package com.surveybridge.survey.dto;

import com.surveybridge.survey.entity.Gender;
import jakarta.validation.constraints.*;

public record TargetingDto(
    @NotBlank String country,
    @Min(16) @Max(99) int ageMin,
    @Min(16) @Max(99) int ageMax,
    @NotNull Gender gender,
    @Min(50) int sampleSize,
    @Min(1) @Max(100) int incidenceRate
) {}
