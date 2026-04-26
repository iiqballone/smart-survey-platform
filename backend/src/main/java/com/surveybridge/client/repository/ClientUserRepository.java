package com.surveybridge.client.repository;

import com.surveybridge.client.entity.ClientUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ClientUserRepository extends JpaRepository<ClientUser, UUID> {
    List<ClientUser> findByClientId(UUID clientId);
    boolean existsByClientIdAndEmail(UUID clientId, String email);
}
