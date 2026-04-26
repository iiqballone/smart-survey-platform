package com.surveybridge.team.service;

import com.surveybridge.client.entity.ClientUser;
import com.surveybridge.client.entity.ClientUserRole;
import com.surveybridge.client.repository.ClientUserRepository;
import com.surveybridge.common.exception.ResourceNotFoundException;
import com.surveybridge.team.dto.InviteRequest;
import com.surveybridge.team.dto.TeamMemberDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeamService {

    private final ClientUserRepository clientUserRepository;

    public List<TeamMemberDto> listMembers(UUID clientId) {
        return clientUserRepository.findByClientId(clientId).stream()
            .map(this::toDto).toList();
    }

    @Transactional
    public TeamMemberDto inviteMember(UUID clientId, InviteRequest req) {
        if (clientUserRepository.existsByClientIdAndEmail(clientId, req.email())) {
            throw new IllegalArgumentException("User already a team member: " + req.email());
        }
        ClientUser user = ClientUser.builder()
            .clientId(clientId)
            .email(req.email())
            .role(req.role())
            .build();
        // In production: call Keycloak Admin REST API to create/invite the user
        // and set user.setKeycloakUserId(keycloakId)
        log.info("Invited {} as {} to client {}", req.email(), req.role(), clientId);
        return toDto(clientUserRepository.save(user));
    }

    @Transactional
    public void removeMember(UUID clientId, UUID userId) {
        ClientUser user = clientUserRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Team member not found: " + userId));
        if (!user.getClientId().equals(clientId)) {
            throw new AccessDeniedException("Access denied");
        }
        // In production: remove from Keycloak group
        clientUserRepository.delete(user);
    }

    private TeamMemberDto toDto(ClientUser u) {
        return new TeamMemberDto(u.getId(), u.getClientId(), u.getKeycloakUserId(),
            u.getEmail(), u.getRole(), u.getCreatedAt());
    }
}
