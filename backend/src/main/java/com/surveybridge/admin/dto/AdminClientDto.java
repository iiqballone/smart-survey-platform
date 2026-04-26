package com.surveybridge.admin.dto;

import com.surveybridge.client.entity.ClientPlan;

import java.time.LocalDateTime;
import java.util.UUID;

public record AdminClientDto(
    UUID id,
    String name,
    String contactEmail,
    ClientPlan plan,
    int monthlyResponseQuota,
    int usedResponseCount,
    boolean active,
    LocalDateTime createdAt
) {}
