# SurveyBridge Backend

Survey sampling orchestration platform that connects clients, SurveyMonkey, and PureSpectrum Fusion.

## Architecture

```
Client (SurveyMonkey survey)
        │  POST /api/v1/surveys (register URL + sampling params)
        ▼
SurveyBridge API ──────────► Fusion API (creates panel entry link)
        │
        │  fusionEntryUrl returned to client for sharing with panel suppliers
        ▼
Panel Supplier ──► Respondent clicks entry link
                        │
                        ▼
                   Fusion assigns rid, redirects to:
                   https://survey.surveymonkey.com/r/ABC?rid={rid}
                        │
                        ▼
                   SurveyMonkey collects answers (we never see them)
                        │
                        ▼
                   SurveyMonkey redirects to:
                   GET /complete?UID=R12345  (or /terminate)
                        │
        ┌───────────────┘
        │  Fusion also sends server-side event:
        │  POST /api/v1/webhook/fusion
        ▼
SurveyBridge API ──► Kafka ──► Consumer persists event
                                      │
                                      ├─► Increment completedCount / screenoutCount
                                      ├─► Forward event to client callbackUrl
                                      └─► Fire milestone notifications
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Java 21, Spring Boot 3.3 |
| Database | PostgreSQL + Flyway migrations |
| Cache | Redis |
| Messaging | Apache Kafka |
| Auth | Keycloak (JWT / OAuth2 resource server) |
| Sampling | PureSpectrum Fusion API |
| Survey hosting | SurveyMonkey (external, client-owned) |
| API Docs | SpringDoc OpenAPI (Swagger UI) |

## Running Locally

### Prerequisites
- Java 21
- Docker (for PostgreSQL, Redis, Kafka, Keycloak)

### Start dependencies

```bash
docker compose up -d
```

### Run the app

```bash
mvn spring-boot:run
```

### Swagger UI

```
http://localhost:8080/swagger-ui.html
```

### OpenAPI JSON spec

```
http://localhost:8080/v3/api-docs
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/surveybridge` | PostgreSQL JDBC URL |
| `DATABASE_USER` | `surveybridge` | DB username |
| `DATABASE_PASSWORD` | `surveybridge` | DB password |
| `KEYCLOAK_ISSUER_URI` | `http://localhost:8180/realms/surveybridge-dev` | JWT issuer URI |
| `KAFKA_BOOTSTRAP_SERVERS` | `localhost:9092` | Kafka brokers |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `FUSION_API_KEY` | `changeme` | PureSpectrum Fusion API key |
| `FUSION_WEBHOOK_SECRET` | `changeme` | HMAC secret for Fusion webhook signature |

## Authentication

All endpoints require a **Bearer JWT** token issued by Keycloak, except:

| Path | Auth |
|------|------|
| `POST /api/v1/webhook/fusion` | None (HMAC-signed by Fusion) |
| `GET /complete` | None (browser redirect from SurveyMonkey) |
| `GET /terminate` | None (browser redirect from SurveyMonkey) |
| `GET /swagger-ui/**` | None |
| `GET /v3/api-docs/**` | None |
| `GET /actuator/health` | None |

Admin endpoints (`/api/v1/admin/**`) additionally require the `PLATFORM_ADMIN` Keycloak role.

## API Overview

### Surveys

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/surveys` | List surveys (paginated, filterable by status) |
| `POST` | `/api/v1/surveys` | Register a new SurveyMonkey survey |
| `GET` | `/api/v1/surveys/{id}` | Get survey details + Fusion entry URL |
| `PUT` | `/api/v1/surveys/{id}` | Update survey (DRAFT only) |
| `DELETE` | `/api/v1/surveys/{id}` | Delete survey (DRAFT only) |
| `POST` | `/api/v1/surveys/{id}/publish` | Push survey to Fusion → get entry link |
| `POST` | `/api/v1/surveys/{id}/pause` | Pause sampling |
| `POST` | `/api/v1/surveys/{id}/close` | Close survey |

### Responses / Events

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/webhook/fusion` | Receive Fusion completion/screenout event |
| `GET` | `/api/v1/surveys/{id}/responses` | List events for a survey |
| `GET` | `/api/v1/surveys/{id}/responses/export` | Export events (CSV or Excel) |
| `GET` | `/complete?UID={rid}` | SurveyMonkey completion redirect |
| `GET` | `/terminate?UID={rid}` | SurveyMonkey screenout redirect |

### Analytics

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/surveys/{id}/analytics` | Per-survey analytics (rates, avg CPI, trend) |
| `GET` | `/api/v1/analytics/summary` | Cross-survey analytics |

### Dashboard

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/dashboard/summary` | KPI summary (totals, rates, this-month count) |
| `GET` | `/api/v1/dashboard/surveys/{id}/timeseries` | Response time series (day/week/month) |
| `GET` | `/api/v1/dashboard/completion-rates` | Completion rate per survey |

### Notifications

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/notifications` | List notifications (last 50) |
| `PUT` | `/api/v1/notifications/{id}/read` | Mark notification read |
| `PUT` | `/api/v1/notifications/read-all` | Mark all notifications read |

### Team

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/team` | List team members |
| `POST` | `/api/v1/team/invite` | Invite a team member |
| `DELETE` | `/api/v1/team/{userId}` | Remove a team member |

### Admin (PLATFORM_ADMIN role required)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/admin/clients` | List all client accounts |
| `GET` | `/api/v1/admin/clients/{id}` | Get client account |
| `PUT` | `/api/v1/admin/clients/{id}/quota` | Update monthly response quota |
| `GET` | `/api/v1/admin/fusion/jobs` | List active Fusion survey jobs |
| `GET` | `/api/v1/admin/health` | System health (Postgres, Redis, Kafka, Keycloak) |
