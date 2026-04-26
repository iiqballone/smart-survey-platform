package com.surveybridge.client.dto;

import com.surveybridge.client.entity.ClientPlan;

import java.time.LocalDateTime;
import java.util.UUID;

public record ClientDto(
    UUID id,
    String name,
    String contactEmail,
    ClientPlan plan,
    int monthlyResponseQuota,
    int usedResponseCount,
    boolean active,
    LocalDateTime createdAt
) {}
