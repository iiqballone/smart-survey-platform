package com.surveybridge.notification.controller;

import com.surveybridge.common.CurrentUserContext;
import com.surveybridge.notification.dto.NotificationDto;
import com.surveybridge.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserContext ctx;

    @GetMapping
    @Operation(summary = "List notifications")
    public List<NotificationDto> list() {
        return notificationService.getForClient(ctx.getClientId());
    }

    @PutMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Mark notification as read")
    public void markRead(@PathVariable UUID id) {
        notificationService.markRead(id, ctx.getClientId());
    }

    @PutMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Mark all notifications as read")
    public void markAllRead() {
        notificationService.markAllRead(ctx.getClientId());
    }
}
