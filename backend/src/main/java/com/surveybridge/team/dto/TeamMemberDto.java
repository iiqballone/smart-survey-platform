package com.surveybridge.team.dto;

import com.surveybridge.client.entity.ClientUserRole;

import java.time.LocalDateTime;
import java.util.UUID;

public record TeamMemberDto(
    UUID id,
    UUID clientId,
    String keycloakUserId,
    String email,
    ClientUserRole role,
    LocalDateTime createdAt
) {}
