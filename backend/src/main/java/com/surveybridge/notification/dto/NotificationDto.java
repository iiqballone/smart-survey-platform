package com.surveybridge.notification.dto;

import com.surveybridge.notification.entity.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationDto(
    UUID id,
    NotificationType type,
    String title,
    String body,
    String link,
    boolean read,
    LocalDateTime createdAt
) {}
