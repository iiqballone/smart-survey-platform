package com.surveybridge.notification.repository;

import com.surveybridge.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByClientIdOrderByCreatedAtDesc(UUID clientId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.clientId = :clientId")
    void markAllReadByClientId(@Param("clientId") UUID clientId);
}
