# BACKEND.md — Backend Application Design

## Tech Stack

| Technology | Purpose |
|---|---|
| Java 21 | Language |
| Spring Boot 3.x | Application framework |
| Spring Security + Keycloak Adapter | JWT validation and RBAC |
| Spring Data JPA + Hibernate | ORM and database access |
| Spring Kafka | Kafka producer/consumer |
| Spring Cache (Redis) | Caching layer |
| Flyway | Database migrations |
| MapStruct | DTO <> Entity mapping |
| OpenAPI / Springdoc | API documentation |

---

## Package Structure

```
com.surveybridge
├── config/
│   ├── SecurityConfig.java          # Keycloak JWT filter, CORS, RBAC
│   ├── KafkaConfig.java
│   ├── RedisConfig.java
│   └── DynataClientConfig.java      # Dynata HTTP client (RestTemplate/WebClient)
│
├── survey/
│   ├── controller/SurveyController.java
│   ├── service/SurveyService.java
│   ├── repository/SurveyRepository.java
│   ├── entity/Survey.java
│   ├── entity/Question.java
│   ├── entity/QuestionOption.java
│   ├── dto/SurveyRequestDto.java
│   ├── dto/SurveyResponseDto.java
│   ├── dto/CreateSurveyRequestDto.java
│   └── mapper/SurveyMapper.java
│
├── response/
│   ├── controller/ResponseController.java   # Dynata webhook + response retrieval
│   ├── service/ResponseService.java
│   ├── consumer/ResponseKafkaConsumer.java
│   ├── producer/ResponseKafkaProducer.java
│   ├── repository/ResponseRepository.java
│   ├── entity/SurveyResponse.java
│   ├── entity/Answer.java
│   └── dto/...
│
├── analytics/
│   ├── controller/AnalyticsController.java  # Per-survey analytics and cross-survey reports
│   ├── service/AnalyticsService.java
│   └── dto/
│       ├── SurveyAnalyticsDto.java          # NPS, demographics, question insights
│       ├── NpsBreakdownDto.java
│       ├── DemographicsDto.java
│       └── QuestionInsightDto.java
│
├── dashboard/
│   ├── controller/DashboardController.java
│   ├── service/DashboardService.java
│   └── dto/
│       ├── DashboardSummaryDto.java
│       ├── TimeSeriesDto.java               # {date, responses, completions}
│       └── CompletionRateDto.java
│
├── client/
│   ├── controller/ClientController.java     # Self-service client profile
│   ├── service/ClientService.java
│   ├── repository/ClientRepository.java
│   ├── entity/Client.java
│   ├── entity/ClientUser.java               # Team members per client
│   └── dto/...
│
├── admin/
│   ├── controller/AdminClientController.java   # PLATFORM_ADMIN only
│   ├── controller/AdminDynataController.java
│   ├── controller/AdminHealthController.java
│   ├── service/AdminService.java
│   └── dto/
│       ├── DynataJobStatusDto.java
│       └── HealthStatusDto.java
│
├── team/
│   ├── controller/TeamController.java       # CLIENT_ADMIN: invite / remove members
│   ├── service/TeamService.java
│   └── dto/
│       ├── TeamMemberDto.java
│       └── InviteRequestDto.java
│
├── notification/
│   ├── controller/NotificationController.java
│   ├── service/NotificationService.java
│   ├── entity/Notification.java
│   └── templates/                           # Email templates
│
├── dynata/
│   ├── DynataAdapter.java                   # Wraps all Dynata API calls
│   ├── dto/DynataSurveyRequest.java
│   ├── dto/DynataProjectResponse.java
│   └── DynataWebhookValidator.java          # HMAC signature validation
│
└── common/
    ├── exception/GlobalExceptionHandler.java
    ├── exception/ResourceNotFoundException.java
    ├── exception/DynataIntegrationException.java
    ├── exception/QuotaExceededException.java
    ├── security/CurrentUserContext.java
    └── util/PaginationUtils.java
```

---

## Core Domain Entities

### Survey
```java
@Entity
public class Survey {
    UUID id;
    UUID clientId;                 // Multi-tenancy FK
    String title;
    String description;
    SurveyStatus status;           // DRAFT, LIVE, PAUSED, COMPLETED
    String dynataProjectId;        // Reference ID from Dynata
    DynataTargeting targeting;     // Embedded JSON (see SurveyTargeting below)
    int targetResponseCount;
    int receivedResponseCount;
    LocalDateTime createdAt;
    LocalDateTime publishedAt;
    LocalDateTime closedAt;
    List<Question> questions;
}
```

### SurveyTargeting (embedded in Survey)
```java
@Embeddable
public class DynataTargeting {
    String country;         // ISO-3166 2-letter code: "US", "GB", etc.
    int ageMin;
    int ageMax;
    Gender gender;          // ALL | MALE | FEMALE
    int sampleSize;
    int incidenceRate;      // 1–100 (% of panelists who qualify)
}
```

### Question
```java
@Entity
public class Question {
    UUID id;
    UUID surveyId;
    int orderIndex;
    String text;
    QuestionType type;           // SINGLE_CHOICE, MULTI_CHOICE, RATING, OPEN_TEXT, NPS, MATRIX
    boolean required;
    String conditionalLogic;     // JSON: { showIf: { questionId, answer } }
    List<QuestionOption> options;
}
```

### SurveyResponse
```java
@Entity
public class SurveyResponse {
    UUID id;
    UUID surveyId;
    String dynataRespondentId;   // Anonymised respondent reference
    String country;
    int ageGroup;                // Lower bound of age bucket (e.g. 25 for 25–34)
    String gender;               // "Male" | "Female" | "Non-binary"
    LocalDateTime completedAt;
    int durationSeconds;
    List<Answer> answers;
}
```

### Answer
```java
@Entity
public class Answer {
    UUID id;
    UUID responseId;
    UUID questionId;
    String questionText;         // Denormalised snapshot for export/reporting
    String value;
}
```

### Client
```java
@Entity
public class Client {
    UUID id;
    String name;
    String keycloakGroupId;      // Links to Keycloak group for this client
    String contactEmail;
    ClientPlan plan;             // STARTER, PROFESSIONAL, ENTERPRISE
    int monthlyResponseQuota;
    int usedResponseCount;
    boolean active;
    LocalDateTime createdAt;
}
```

### ClientUser
```java
@Entity
public class ClientUser {
    UUID id;
    UUID clientId;
    String keycloakUserId;
    String email;
    ClientUserRole role;         // CLIENT_ADMIN | CLIENT_VIEWER
    LocalDateTime createdAt;
}
```

### Notification
```java
@Entity
public class Notification {
    UUID id;
    UUID clientId;
    NotificationType type;       // SUCCESS, WARNING, INFO, ERROR
    String title;
    String body;
    String link;                 // Relative frontend path (e.g. "/surveys/abc/reports")
    boolean read;
    LocalDateTime createdAt;
}
```

---

## API Endpoints

All endpoints are prefixed `/api/v1`. All require `Authorization: Bearer <JWT>` except the Dynata webhook.

### Surveys — `SurveyController`

| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/surveys` | CLIENT_ADMIN, CLIENT_VIEWER | List surveys (paginated). Query: `status`, `page`, `size`, `sort` |
| `POST` | `/surveys` | CLIENT_ADMIN | Create survey as DRAFT |
| `GET` | `/surveys/{id}` | CLIENT_ADMIN, CLIENT_VIEWER | Get survey with questions |
| `PUT` | `/surveys/{id}` | CLIENT_ADMIN | Update title, description, targeting, questions (DRAFT only) |
| `DELETE` | `/surveys/{id}` | CLIENT_ADMIN | Delete survey (DRAFT only) |
| `POST` | `/surveys/{id}/publish` | CLIENT_ADMIN | Validate quota → push to Dynata → set LIVE |
| `POST` | `/surveys/{id}/pause` | CLIENT_ADMIN | Pause Dynata project → set PAUSED |
| `POST` | `/surveys/{id}/close` | CLIENT_ADMIN | Finalise survey → set COMPLETED |

**`GET /surveys` response shape** — `PagedResult<SurveyDto>`:
```json
{
  "content": [ ... ],
  "totalElements": 12,
  "totalPages": 2,
  "page": 0,
  "size": 10
}
```

**`POST /surveys` request body** — `CreateSurveyRequestDto`:
```json
{
  "title": "Q2 Brand Perception",
  "description": "...",
  "targeting": {
    "country": "US",
    "ageMin": 18,
    "ageMax": 65,
    "gender": "ALL",
    "sampleSize": 500,
    "incidenceRate": 50
  },
  "questions": [
    {
      "text": "How likely are you to recommend us?",
      "type": "NPS",
      "required": true,
      "options": []
    }
  ]
}
```

---

### Responses — `ResponseController`

| Method | Path | Role | Description |
|---|---|---|---|
| `POST` | `/webhook/dynata` | (public, HMAC-signed) | Receive Dynata response events |
| `GET` | `/surveys/{id}/responses` | CLIENT_ADMIN, CLIENT_VIEWER | Paginated responses. Query: `from`, `to`, `page`, `size` |
| `GET` | `/surveys/{id}/responses/export` | CLIENT_ADMIN | Stream CSV or Excel. Query: `format=csv\|excel` |

**`GET /surveys/{id}/responses` response shape** — `PagedResult<SurveyResponseDto>`:
```json
{
  "content": [
    {
      "id": "...",
      "surveyId": "...",
      "dynataRespondentId": "R-123",
      "country": "US",
      "ageGroup": 25,
      "gender": "Female",
      "completedAt": "2026-04-20T14:32:00Z",
      "durationSeconds": 177,
      "answers": [
        { "questionId": "...", "questionText": "How likely...", "value": "9" }
      ]
    }
  ],
  "totalElements": 312,
  "totalPages": 32,
  "page": 0,
  "size": 10
}
```

---

### Dashboard — `DashboardController`

| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/dashboard/summary` | CLIENT_ADMIN, CLIENT_VIEWER | Aggregate KPIs for the current client |
| `GET` | `/dashboard/surveys/{id}/timeseries` | CLIENT_ADMIN, CLIENT_VIEWER | Daily/weekly response counts for a survey |
| `GET` | `/dashboard/completion-rates` | CLIENT_ADMIN, CLIENT_VIEWER | Completion rate per survey |

**`GET /dashboard/summary` response** — `DashboardSummaryDto`:
```json
{
  "totalSurveys": 5,
  "activeSurveys": 2,
  "totalResponses": 1145,
  "avgCompletionRate": 77,
  "responsesThisMonth": 400
}
```

**`GET /dashboard/surveys/{id}/timeseries` params**: `from` (ISO date), `to` (ISO date), `granularity` (`day` | `week`)

**`GET /dashboard/surveys/{id}/timeseries` response**:
```json
{
  "surveyId": "...",
  "data": [
    { "date": "2026-04-01", "responses": 24, "completions": 19 }
  ]
}
```

**`GET /dashboard/completion-rates` response** — `List<CompletionRateDto>`:
```json
[
  {
    "surveyId": "...",
    "title": "Q2 Brand Perception",
    "completionRate": 71.0,
    "receivedResponseCount": 312,
    "targetResponseCount": 500
  }
]
```

---

### Analytics — `AnalyticsController`

Provides per-survey and cross-survey analytics data consumed by `ReportView` and `AnalyticsPage`.

| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/surveys/{id}/analytics` | CLIENT_ADMIN, CLIENT_VIEWER | Full analytics report for a single survey |
| `GET` | `/analytics/summary` | CLIENT_ADMIN, CLIENT_VIEWER | Cross-survey aggregates (country, age, NPS per survey) |

**`GET /surveys/{id}/analytics` response** — `SurveyAnalyticsDto`:
```json
{
  "surveyId": "...",
  "nps": {
    "score": 42,
    "promotersPct": 60,
    "passivesPct": 22,
    "detractorsPct": 18
  },
  "avgDurationSeconds": 177,
  "demographics": {
    "gender": [
      { "label": "Female",     "pct": 48 },
      { "label": "Male",       "pct": 44 },
      { "label": "Non-binary", "pct": 8  }
    ],
    "ageGroups": [
      { "age": "18–24", "pct": 22 },
      { "age": "25–34", "pct": 35 }
    ],
    "countries": [
      { "country": "US", "count": 210 }
    ]
  },
  "questionInsights": [
    {
      "questionId": "...",
      "questionText": "Would you recommend us?",
      "type": "SINGLE_CHOICE",
      "answerDistribution": [
        { "answer": "Yes, definitely", "pct": 54 },
        { "answer": "Maybe",           "pct": 28 }
      ]
    }
  ]
}
```

**`GET /analytics/summary` response**:
```json
{
  "responseTrend": [
    { "date": "2026-04-01", "responses": 24, "completions": 19 }
  ],
  "byCountry": [
    { "country": "US", "responses": 382 }
  ],
  "byAgeGroup": [
    { "age": "18–24", "count": 187 }
  ],
  "surveyPerformance": [
    {
      "id": "...",
      "title": "Q2 Brand Perception",
      "received": 312,
      "target": 500,
      "completionRate": 71,
      "nps": 42,
      "status": "LIVE"
    }
  ]
}
```

---

### Notifications — `NotificationController`

| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/notifications` | CLIENT_ADMIN, CLIENT_VIEWER | List notifications for current user (most recent 50) |
| `PUT` | `/notifications/{id}/read` | CLIENT_ADMIN, CLIENT_VIEWER | Mark a single notification as read |
| `PUT` | `/notifications/read-all` | CLIENT_ADMIN, CLIENT_VIEWER | Mark all notifications as read |

**`GET /notifications` response** — `List<NotificationDto>`:
```json
[
  {
    "id": "...",
    "type": "SUCCESS",
    "title": "Survey quota reached",
    "body": "NPS Benchmark 2025 collected all 600 responses.",
    "link": "/surveys/5/reports",
    "read": false,
    "createdAt": "2026-04-25T14:00:00Z"
  }
]
```

Notification events that trigger creation:
- Survey reaches 100% of `targetResponseCount` → `SUCCESS`
- Survey reaches 50% milestone → `INFO`
- Client quota reaches 75% / 90% → `WARNING`
- Dynata sync paused due to low IR → `WARNING`
- Team member accepts invitation → `INFO`

---

### Team Management — `TeamController`

| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/team` | CLIENT_ADMIN, CLIENT_VIEWER | List team members for current client |
| `POST` | `/team/invite` | CLIENT_ADMIN | Invite user by email with a role |
| `DELETE` | `/team/{userId}` | CLIENT_ADMIN | Remove a team member |

**`GET /team` response** — `List<TeamMemberDto>`:
```json
[
  {
    "id": "...",
    "clientId": "...",
    "keycloakUserId": "...",
    "email": "bob@acme.com",
    "role": "CLIENT_VIEWER",
    "createdAt": "2026-03-01T10:00:00Z"
  }
]
```

**`POST /team/invite` request body**:
```json
{ "email": "alice@acme.com", "role": "CLIENT_VIEWER" }
```

---

### Admin (PLATFORM_ADMIN only) — `AdminClientController`, `AdminDynataController`, `AdminHealthController`

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/clients` | List all clients (paginated). Query: `page`, `size` |
| `GET` | `/admin/clients/{id}` | Get single client with usage stats |
| `PUT` | `/admin/clients/{id}/quota` | Update monthly response quota |
| `GET` | `/admin/dynata/jobs` | List active Dynata project sync statuses |
| `GET` | `/admin/health` | System health check (Postgres, Redis, Kafka, Keycloak) |

**`GET /admin/clients` response** — `PagedResult<ClientDto>`:
```json
{
  "content": [
    {
      "id": "...",
      "name": "Acme Corp",
      "contactEmail": "admin@acme.com",
      "plan": "PROFESSIONAL",
      "monthlyResponseQuota": 5000,
      "usedResponseCount": 3900,
      "active": true,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ],
  "totalElements": 24,
  "totalPages": 3,
  "page": 0,
  "size": 10
}
```

**`PUT /admin/clients/{id}/quota` request body**:
```json
{ "monthlyResponseQuota": 10000 }
```

**`GET /admin/dynata/jobs` response** — `List<DynataJobStatusDto>`:
```json
[
  {
    "dynataProjectId": "DYN-98765",
    "title": "Q2 Brand Perception Study",
    "syncStatus": "SYNCED",
    "receivedResponseCount": 312,
    "targetResponseCount": 500
  }
]
```

**`GET /admin/health` response** — `HealthStatusDto`:
```json
{
  "status": "UP",
  "components": {
    "postgres":  { "status": "UP" },
    "redis":     { "status": "UP" },
    "kafka":     { "status": "UP" },
    "keycloak":  { "status": "UP" }
  }
}
```

---

## Service Layer Design

### SurveyService
- `createSurvey(clientId, CreateSurveyRequestDto)` — Validates, persists survey as DRAFT
- `updateSurvey(surveyId, CreateSurveyRequestDto)` — Updates DRAFT surveys; rejects update on LIVE/COMPLETED
- `deleteSurvey(surveyId)` — Hard-deletes DRAFT surveys; rejects others
- `publishSurvey(surveyId)` — Validates quota, calls DynataAdapter, updates status to LIVE
- `pauseSurvey(surveyId)` — Calls Dynata to pause, updates status to PAUSED
- `closeSurvey(surveyId)` — Finalises survey, calculates final stats, sets COMPLETED
- `getSurvey(surveyId)` — Returns survey with questions; enforces client ownership
- `listSurveys(clientId, filters, pageable)` — Paginated list with optional status filter

### ResponseService
- `handleIncomingWebhook(payload, signature)` — Validates HMAC signature, publishes to Kafka
- `persistResponse(ResponseDto)` — Kafka consumer; writes SurveyResponse + Answers to DB; increments `receivedResponseCount`; checks quota/milestone thresholds and fires notifications
- `getResponses(surveyId, filters, pageable)` — Paginated response retrieval with date-range filter
- `exportResponses(surveyId, format)` — Streams CSV or Excel; includes question text in each answer row

### DashboardService
- `getClientSummary(clientId)` — KPI aggregates: survey count, response totals, avg completion rate, responses this month
- `getResponseTimeSeries(surveyId, from, to, granularity)` — Time-bucketed response + completion counts for charts
- `getCompletionRates(clientId)` — Per-survey completion percentage
- Heavily cached in Redis with configurable TTL

### AnalyticsService
- `getSurveyAnalytics(surveyId)` — Computes NPS (promoters/passives/detractors), avg duration, gender/age/country breakdown, per-question answer distributions
- `getCrossSurveyAnalytics(clientId, from, to)` — Aggregates response trend, geographic and age distribution, per-survey performance table
- Results cached in Redis; cache is invalidated when new responses arrive for the survey

### NotificationService
- `createNotification(clientId, type, title, body, link)` — Persists and (in future) pushes via WebSocket/SSE
- `getNotifications(clientId)` — Returns 50 most recent, sorted by creation date desc
- `markRead(notificationId)` — Sets `read = true`
- `markAllRead(clientId)` — Bulk update for current client

### TeamService
- `listMembers(clientId)` — Returns all ClientUser records for the client
- `inviteMember(clientId, email, role)` — Creates Keycloak user invite + ClientUser record
- `removeMember(clientId, userId)` — Removes from Keycloak group + deletes ClientUser

### AdminService
- `listClients(pageable)` — All clients with quota usage; PLATFORM_ADMIN only
- `getClient(clientId)` — Single client detail
- `updateQuota(clientId, quota)` — Adjusts monthly response quota
- `getDynataJobs()` — Queries DynataAdapter for live project sync states
- `getSystemHealth()` — Pings Postgres, Redis, Kafka, Keycloak and aggregates status

---

## Security Design

### Roles
| Role | Scope |
|---|---|
| `CLIENT_ADMIN` | Full access to own client's surveys, responses, analytics, team management |
| `CLIENT_VIEWER` | Read-only access to own client's surveys, responses, analytics |
| `PLATFORM_ADMIN` | All `/admin/*` endpoints; can view and manage all clients |

### JWT Validation
Every API request (except Dynata webhook) requires a valid Bearer JWT issued by Keycloak.

```
Request → Security Filter → Extract JWT → Validate signature with Keycloak public key
→ Extract clientId claim + roles → Set SecurityContext → Route to Controller
```

### Multi-Tenancy Enforcement
Every service method that reads or writes survey/response data applies a `clientId` filter derived from the JWT. This prevents cross-client data access even if a survey ID is guessed.

```java
// Example enforcement in SurveyService
UUID currentClientId = CurrentUserContext.getClientId();
Survey survey = surveyRepository.findByIdAndClientId(surveyId, currentClientId)
    .orElseThrow(() -> new ResourceNotFoundException("Survey not found"));
```

### Dynata Webhook Security
All incoming webhooks from Dynata are validated using HMAC-SHA256 signature verification before any processing occurs.

---

## Error Handling

A global `@ControllerAdvice` maps exceptions to standard HTTP responses:

| Exception | HTTP Status |
|---|---|
| `ResourceNotFoundException` | 404 |
| `AccessDeniedException` | 403 |
| `ValidationException` | 400 |
| `DynataIntegrationException` | 502 |
| `QuotaExceededException` | 429 |
| Uncaught exceptions | 500 |

All error responses follow a consistent JSON envelope:
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Survey not found",
  "timestamp": "2026-04-25T10:00:00Z",
  "path": "/api/v1/surveys/abc123"
}
```

---

## Pagination Envelope

All paginated list endpoints return `PagedResult<T>`:

```json
{
  "content": [ ... ],
  "totalElements": 100,
  "totalPages": 10,
  "page": 0,
  "size": 10
}
```

Standard query parameters: `page` (0-indexed), `size` (default 10), `sort` (e.g. `createdAt,desc`).
