package com.surveybridge.client.dto;

import com.surveybridge.client.entity.ClientUserRole;

import java.time.LocalDateTime;
import java.util.UUID;

public record ClientUserDto(
    UUID id,
    UUID clientId,
    String keycloakUserId,
    String email,
    ClientUserRole role,
    LocalDateTime createdAt
) {}
