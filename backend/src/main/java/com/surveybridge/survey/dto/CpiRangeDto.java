package com.surveybridge.survey.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CpiRangeDto(
    @NotNull @DecimalMin("0.0") BigDecimal min,
    @NotNull @DecimalMin("0.0") BigDecimal max
) {}
