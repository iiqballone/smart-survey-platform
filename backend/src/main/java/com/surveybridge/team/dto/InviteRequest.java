package com.surveybridge.team.dto;

import com.surveybridge.client.entity.ClientUserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InviteRequest(
    @NotBlank @Email String email,
    @NotNull ClientUserRole role
) {}
