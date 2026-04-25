# DYNATA_INTEGRATION.md — Dynata Panel Integration Design

## Overview

Dynata is a third-party survey panel provider. SurveyBridge integrates with Dynata's REST API to:
1. **Dispatch** a survey (create a Dynata "project") when a client publishes
2. **Receive** responses via Dynata's webhook callback mechanism
3. **Manage** the lifecycle of a survey (pause, resume, close) in sync with Dynata

---

## Integration Architecture

```
SurveyBridge Backend
        │
        │  1. Publish Survey
        ├─────────────────────────────────► Dynata REST API
        │        POST /projects             (creates project, returns projectId)
        │
        │  2. Response Webhook
        │◄─────────────────────────────────
        │        POST /webhooks/dynata/responses
        │        (Dynata fires per response)
        │
        │  3. Project Management
        ├─────────────────────────────────► Dynata REST API
        │        PATCH /projects/{id}        (pause / resume / close)
```

---

## Dynata Adapter Design

All Dynata API interactions are isolated in `DynataAdapter.java`. This single class is the only place in the codebase that knows about Dynata — making future panel provider swaps straightforward.

```java
public interface PanelAdapter {
    DynataProjectResponse createProject(DynataSurveyRequest request);
    void pauseProject(String dynataProjectId);
    void resumeProject(String dynataProjectId);
    void closeProject(String dynataProjectId);
}

@Component
public class DynataAdapter implements PanelAdapter {
    // Implementation using Spring RestTemplate / WebClient
    // Base URL, API key injected from application.yml
}
```

---

## Dynata API Credentials

Stored in environment variables / secrets manager — never hardcoded:
```yaml
dynata:
  base-url: https://api.dynata.com
  api-key: ${DYNATA_API_KEY}
  webhook-secret: ${DYNATA_WEBHOOK_SECRET}
```

---

## Survey Dispatch Payload

When a client publishes a survey, SurveyBridge constructs a Dynata project request:

```json
{
  "name": "SB-{surveyId} — Q2 Brand Perception",
  "surveyUrl": "https://survey.surveybridge.io/s/{surveyId}?respondentId={{RESPONDENT_ID}}",
  "completionUrl": "https://api.surveybridge.io/webhooks/dynata/responses",
  "targeting": {
    "country": "US",
    "ageRange": { "min": 18, "max": 35 },
    "gender": "ALL",
    "sampleSize": 500,
    "incidenceRate": 60
  }
}
```

Dynata returns a `projectId` (stored as `dynata_project_id` in the `surveys` table).

---

## Response Webhook

Dynata fires a POST to our callback URL for each completed response.

### Endpoint
`POST https://api.surveybridge.io/webhooks/dynata/responses`

### Webhook Validation
```java
@PostMapping("/webhooks/dynata/responses")
public ResponseEntity<Void> handleWebhook(
    @RequestHeader("X-Dynata-Signature") String signature,
    @RequestBody String rawBody
) {
    dynataWebhookValidator.validate(rawBody, signature); // HMAC-SHA256
    ResponseDto dto = objectMapper.readValue(rawBody, ResponseDto.class);
    responseKafkaProducer.publish(dto);
    return ResponseEntity.accepted().build();
}
```

HMAC validation:
```java
String expected = HMAC_SHA256(rawBody, DYNATA_WEBHOOK_SECRET);
if (!expected.equals(signature)) throw new InvalidWebhookSignatureException();
```

---

## Response Ingestion Pipeline

```
Dynata Webhook
     │
     ▼
ResponseController (validates signature)
     │
     ▼
Kafka Producer → Topic: response.received
     │
     ▼
Kafka Consumer (ResponseKafkaConsumer)
     │
     ├── Persist SurveyResponse + Answers to PostgreSQL
     ├── Increment survey.received_response_count
     ├── Check if target count reached → auto-close if yes
     └── Publish to Topic: survey.completed (if threshold met)
```

Using Kafka decouples the high-volume ingest from the database writes, and provides replay capability if the database is temporarily unavailable.

---

## Error Handling & Retry

| Scenario | Handling |
|---|---|
| Dynata API down on publish | Retry with exponential backoff (max 3 attempts); notify PLATFORM_ADMIN |
| Invalid webhook signature | Return 401; log alert |
| Duplicate response (same respondentId + surveyId) | Idempotency check; discard duplicate |
| Kafka consumer failure | Kafka offset not committed; message reprocessed on restart |
| DB write failure after Kafka consume | Dead letter queue; manual review |

---

## Dynata Sync Status

Each survey has a `dynata_sync_status` field visible in the admin panel:

| Status | Meaning |
|---|---|
| `PENDING` | Survey queued for dispatch |
| `SYNCED` | Successfully created in Dynata |
| `SYNC_FAILED` | Dispatch to Dynata failed |
| `PAUSED_SYNCED` | Pause confirmed by Dynata |
| `CLOSED_SYNCED` | Close confirmed by Dynata |
