package com.surveybridge.common;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class CurrentUserContext {

    public UUID getClientId() {
        String raw = getJwt().getClaimAsString("client_id");
        if (raw == null) throw new AccessDeniedException("No client_id claim in token");
        return UUID.fromString(raw);
    }

    public String getUserId() {
        return getJwt().getSubject();
    }

    public String getUserEmail() {
        return getJwt().getClaimAsString("email");
    }

    public List<String> getRoles() {
        Map<String, Object> realmAccess = getJwt().getClaimAsMap("realm_access");
        if (realmAccess == null) return List.of();
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) realmAccess.get("roles");
        return roles != null ? roles : List.of();
    }

    public boolean isAdmin() {
        return getRoles().contains("PLATFORM_ADMIN");
    }

    private Jwt getJwt() {
        return (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
