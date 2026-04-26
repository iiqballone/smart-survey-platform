package com.surveybridge.client.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "clients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "keycloak_group_id")
    private String keycloakGroupId;

    @Column(name = "contact_email", nullable = false)
    private String contactEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ClientPlan plan = ClientPlan.STARTER;

    @Column(name = "monthly_response_quota", nullable = false)
    @Builder.Default
    private int monthlyResponseQuota = 1000;

    @Column(name = "used_response_count", nullable = false)
    @Builder.Default
    private int usedResponseCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
