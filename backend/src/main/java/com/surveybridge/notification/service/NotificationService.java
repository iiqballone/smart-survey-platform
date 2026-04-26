package com.surveybridge.notification.service;

import com.surveybridge.common.exception.ResourceNotFoundException;
import com.surveybridge.notification.dto.NotificationDto;
import com.surveybridge.notification.entity.Notification;
import com.surveybridge.notification.entity.NotificationType;
import com.surveybridge.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<NotificationDto> getForClient(UUID clientId) {
        return notificationRepository.findByClientIdOrderByCreatedAtDesc(clientId)
            .stream().limit(50).map(this::toDto).toList();
    }

    @Transactional
    public void markRead(UUID notificationId, UUID clientId) {
        Notification n = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!n.getClientId().equals(clientId)) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied");
        }
        n.setRead(true);
    }

    @Transactional
    public void markAllRead(UUID clientId) {
        notificationRepository.markAllReadByClientId(clientId);
    }

    @Transactional
    public void createNotification(UUID clientId, String type, String title, String body, String link) {
        notificationRepository.save(Notification.builder()
            .clientId(clientId)
            .type(NotificationType.valueOf(type))
            .title(title)
            .body(body)
            .link(link)
            .build());
    }

    private NotificationDto toDto(Notification n) {
        return new NotificationDto(n.getId(), n.getType(), n.getTitle(), n.getBody(),
            n.getLink(), n.isRead(), n.getCreatedAt());
    }
}
