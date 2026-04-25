# AUTH.md — Authentication & Authorization Design

## Technology: Keycloak

Keycloak is the central Identity Provider (IdP) for SurveyBridge. It handles all user authentication, session management, and role-based access control (RBAC) using the OpenID Connect (OIDC) protocol.

---

## Keycloak Realm Structure

```
Realm: surveybridge
│
├── Clients (OAuth2 Applications)
│   ├── surveybridge-frontend   (public client — React SPA)
│   └── surveybridge-backend    (confidential client — Spring Boot)
│
├── Roles
│   ├── PLATFORM_ADMIN
│   ├── CLIENT_ADMIN
│   └── CLIENT_VIEWER
│
└── Groups
    ├── client-{clientId-1}     (one group per Client tenant)
    ├── client-{clientId-2}
    └── ...
```

---

## Role Definitions

| Role | Description | Assigned To |
|---|---|---|
| `PLATFORM_ADMIN` | Full platform access; manages all clients | Internal SurveyBridge team |
| `CLIENT_ADMIN` | Full access within their client tenant; can invite team members | Client power users |
| `CLIENT_VIEWER` | Read-only access to surveys, responses, and dashboards | Client analysts |

---

## Client Groups (Multi-Tenancy)

Each client organisation in SurveyBridge has a corresponding Keycloak **Group** named `client-{uuid}`. All users belonging to that client are members of the group. The group ID is stored in the `clients` table as `keycloak_group_id`.

When a user authenticates, their JWT contains:
```json
{
  "sub": "user-uuid",
  "email": "user@clientorg.com",
  "realm_access": {
    "roles": ["CLIENT_ADMIN"]
  },
  "client_group_id": "client-uuid-here"
}
```

The backend extracts `client_group_id` from the token to enforce tenant isolation on every data access.

---

## Authentication Flow — Frontend (OIDC Authorization Code + PKCE)

```
1. User visits https://app.surveybridge.io
2. Keycloak-js checks for existing session → none found
3. Redirect to Keycloak login page:
   GET /auth/realms/surveybridge/protocol/openid-connect/auth
     ?client_id=surveybridge-frontend
     &redirect_uri=https://app.surveybridge.io/auth/callback
     &response_type=code
     &scope=openid profile email
     &code_challenge=<PKCE challenge>

4. User enters credentials on Keycloak-hosted login page
5. Keycloak validates credentials → redirects back:
   GET https://app.surveybridge.io/auth/callback?code=AUTH_CODE

6. Frontend exchanges code for tokens:
   POST /auth/realms/surveybridge/protocol/openid-connect/token
     { code, code_verifier, client_id, redirect_uri }

7. Keycloak returns:
   { access_token, refresh_token, id_token, expires_in }

8. access_token stored in memory only (NOT localStorage / sessionStorage)
9. Axios interceptor adds: Authorization: Bearer <access_token>
10. Before expiry: Keycloak-js silent refresh using iframe/refresh_token
11. On logout: POST /token/revoke, clear memory, redirect to Keycloak logout
```

---

## Token Validation — Backend

Spring Security is configured to validate every incoming JWT against Keycloak's JWKS endpoint.

```java
// SecurityConfig.java
http.oauth2ResourceServer(oauth2 -> oauth2
    .jwt(jwt -> jwt
        .jwkSetUri("https://keycloak.surveybridge.io/realms/surveybridge/protocol/openid-connect/certs")
    )
);
```

Custom `JwtAuthenticationConverter` extracts:
- `realm_access.roles` → Spring Security `GrantedAuthority` list
- `client_group_id` → stored in `CurrentUserContext` for data access filtering

---

## RBAC Enforcement

### Endpoint Level (Annotations)
```java
@PreAuthorize("hasRole('CLIENT_ADMIN')")
@PostMapping("/surveys/{id}/publish")
public ResponseEntity<SurveyDto> publishSurvey(@PathVariable UUID id) { ... }
```

### Data Level (Service Layer)
```java
// Every data query includes client ID from token — cannot be overridden by request
UUID clientId = CurrentUserContext.getClientId(); // extracted from JWT
return surveyRepository.findAllByClientId(clientId, pageable);
```

---

## User Invitation Flow (CLIENT_ADMIN)

```
1. CLIENT_ADMIN enters team member's email on Team Management page
2. Frontend POST /settings/team/invite { email, role }
3. Backend calls Keycloak Admin API to:
   a. Create user in realm
   b. Assign CLIENT_VIEWER or CLIENT_ADMIN role
   c. Add user to client's group (client-{uuid})
   d. Trigger Keycloak's built-in "Set Password" email
4. New user receives email → sets password → logs in
5. Backend creates record in client_users table
```

---

## Security Hardening

| Measure | Detail |
|---|---|
| PKCE | Required for all frontend auth flows |
| Token storage | Access token in memory only; refresh token in HttpOnly cookie |
| Token expiry | Access token: 5 minutes; Refresh token: 8 hours |
| Brute force protection | Keycloak built-in lockout after 5 failed attempts |
| MFA | Optional TOTP (Google Authenticator) — required for PLATFORM_ADMIN |
| Session invalidation | On logout, all tokens revoked via Keycloak |
| CORS | Backend only accepts requests from known frontend origin |
