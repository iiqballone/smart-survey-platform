package com.surveybridge.analytics.dto;

import java.util.List;

public record DemographicsDto(
    List<DemographicItemDto> gender,
    List<DemographicItemDto> ageGroups,
    List<DemographicItemDto> countries
) {}
