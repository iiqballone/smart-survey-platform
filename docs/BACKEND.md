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
│   └── mapper/SurveyMapper.java
│
├── response/
│   ├── controller/ResponseController.java   # Dynata webhook endpoint
│   ├── service/ResponseService.java
│   ├── consumer/ResponseKafkaConsumer.java
│   ├── producer/ResponseKafkaProducer.java
│   ├── repository/ResponseRepository.java
│   ├── entity/SurveyResponse.java
│   ├── entity/Answer.java
│   └── dto/...
│
├── client/
│   ├── controller/ClientController.java
│   ├── service/ClientService.java
│   ├── repository/ClientRepository.java
│   ├── entity/Client.java
│   └── dto/...
│
├── dashboard/
│   ├── controller/DashboardController.java
│   ├── service/DashboardService.java
│   └── dto/DashboardSummaryDto.java
│
├── dynata/
│   ├── DynataAdapter.java           # Wraps all Dynata API calls
│   ├── dto/DynataSurveyRequest.java
│   ├── dto/DynataProjectResponse.java
│   └── DynataWebhookValidator.java  # HMAC signature validation
│
├── notification/
│   ├── service/NotificationService.java
│   └── templates/                   # Email templates
│
└── common/
    ├── exception/GlobalExceptionHandler.java
    ├── exception/ResourceNotFoundException.java
    ├── exception/DynataIntegrationException.java
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
    UUID clientId;               // Multi-tenancy FK
    String title;
    String description;
    SurveyStatus status;         // DRAFT, LIVE, PAUSED, COMPLETED
    String dynataProjectId;      // Reference ID from Dynata
    DynataTargeting targeting;   // Embedded JSON: country, age, gender, sampleSize
    int targetResponseCount;
    int receivedResponseCount;
    LocalDateTime createdAt;
    LocalDateTime publishedAt;
    LocalDateTime closedAt;
    List<Question> questions;
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
    int ageGroup;
    String gender;
    LocalDateTime completedAt;
    int durationSeconds;
    List<Answer> answers;
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
}
```

---

## Service Layer Design

### SurveyService
- `createSurvey(clientId, SurveyRequestDto)` — Validates, persists survey as DRAFT
- `publishSurvey(surveyId)` — Validates quota, calls DynataAdapter, updates status to LIVE
- `pauseSurvey(surveyId)` — Calls Dynata to pause, updates status
- `closeSurvey(surveyId)` — Finalises survey, calculates final stats
- `getSurvey(surveyId)` — Returns survey with questions; enforces client ownership

### ResponseService
- `handleIncomingWebhook(payload, signature)` — Validates signature, publishes to Kafka
- `persistResponse(ResponseDto)` — Kafka consumer; writes to DB
- `getResponses(surveyId, filters, pageable)` — Paginated response retrieval
- `exportResponses(surveyId, format)` — Generates CSV/Excel export

### DashboardService
- `getClientSummary(clientId)` — KPI aggregates: survey count, response totals, avg completion
- `getResponseTimeSeries(surveyId, dateRange)` — Daily response counts for charts
- `getCompletionRates(clientId)` — Per-survey completion stats
- Heavily cached in Redis with configurable TTL

---

## Security Design

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
