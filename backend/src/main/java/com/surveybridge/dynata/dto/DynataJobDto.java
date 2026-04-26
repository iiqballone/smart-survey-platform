package com.surveybridge.dynata.dto;

public record DynataJobDto(
    String dynataProjectId,
    String title,
    String syncStatus,
    int receivedResponseCount,
    int targetResponseCount
) {}
