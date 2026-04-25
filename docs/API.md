# API.md — REST API Contract

## Base URL
```
https://api.surveybridge.io/api/v1
```

## Authentication
All endpoints require `Authorization: Bearer <access_token>` unless otherwise noted.

---

## Surveys

### List Surveys
`GET /surveys`

Query params: `status`, `page`, `size`, `sort`

Response `200`:
```json
{
  "content": [
    {
      "id": "uuid",
      "title": "Q2 Brand Perception Study",
      "status": "LIVE",
      "targetResponseCount": 500,
      "receivedResponseCount": 213,
      "createdAt": "2026-04-01T09:00:00Z",
      "publishedAt": "2026-04-02T11:00:00Z"
    }
  ],
  "totalElements": 12,
  "totalPages": 2,
  "page": 0,
  "size": 10
}
```

---

### Create Survey
`POST /surveys`

Request body:
```json
{
  "title": "Q2 Brand Perception Study",
  "description": "Understanding brand awareness among 18-35 year olds",
  "targeting": {
    "country": "US",
    "ageMin": 18,
    "ageMax": 35,
    "gender": "ALL",
    "sampleSize": 500,
    "incidenceRate": 60
  },
  "questions": [
    {
      "text": "How familiar are you with our brand?",
      "type": "SINGLE_CHOICE",
      "required": true,
      "options": ["Very familiar", "Somewhat familiar", "Not familiar"]
    }
  ]
}
```

Response `201`:
```json
{
  "id": "uuid",
  "status": "DRAFT",
  "createdAt": "2026-04-25T10:00:00Z"
}
```

---

### Get Survey
`GET /surveys/{surveyId}`

Response `200`: Full survey object with questions, targeting, and Dynata sync status.

---

### Publish Survey
`POST /surveys/{surveyId}/publish`

Triggers dispatch to Dynata. Survey must be in `DRAFT` status.

Response `200`:
```json
{
  "id": "uuid",
  "status": "LIVE",
  "dynataProjectId": "DYN-98765",
  "publishedAt": "2026-04-25T12:00:00Z"
}
```

---

### Pause Survey
`POST /surveys/{surveyId}/pause`

Response `200`: Updated survey object with `status: PAUSED`

---

### Close Survey
`POST /surveys/{surveyId}/close`

Response `200`: Updated survey object with `status: COMPLETED`

---

## Responses

### List Responses
`GET /surveys/{surveyId}/responses`

Query params: `page`, `size`, `from` (ISO date), `to` (ISO date)

Response `200`:
```json
{
  "content": [
    {
      "id": "uuid",
      "completedAt": "2026-04-10T14:22:00Z",
      "durationSeconds": 183,
      "country": "US",
      "gender": "MALE",
      "ageGroup": 25,
      "answers": [
        {
          "questionId": "uuid",
          "questionText": "How familiar are you with our brand?",
          "value": "Very familiar"
        }
      ]
    }
  ],
  "totalElements": 213,
  "page": 0,
  "size": 20
}
```

---

### Export Responses
`GET /surveys/{surveyId}/responses/export`

Query params: `format` (`csv` or `excel`)

Response: File download (`Content-Disposition: attachment`)

---

## Dashboard

### Client Summary
`GET /dashboard/summary`

Response `200`:
```json
{
  "totalSurveys": 12,
  "activeSurveys": 3,
  "totalResponses": 4821,
  "avgCompletionRate": 73.4,
  "responsesThisMonth": 1203
}
```

---

### Response Time Series
`GET /dashboard/surveys/{surveyId}/timeseries`

Query params: `from`, `to`, `granularity` (`day` | `week`)

Response `200`:
```json
{
  "surveyId": "uuid",
  "data": [
    { "date": "2026-04-01", "count": 45 },
    { "date": "2026-04-02", "count": 62 }
  ]
}
```

---

## Dynata Webhook (Internal Endpoint)

### Receive Response Callback
`POST /webhooks/dynata/responses`

> This endpoint is NOT authenticated via Keycloak. It is validated using HMAC-SHA256 signature in the `X-Dynata-Signature` header.

Request body (example from Dynata):
```json
{
  "projectId": "DYN-98765",
  "respondentId": "anon-abc123",
  "completedAt": "2026-04-10T14:22:00Z",
  "durationSeconds": 183,
  "answers": [ ... ]
}
```

Response `202 Accepted` (processing is async via Kafka)

---

## Admin Endpoints (PLATFORM_ADMIN only)

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/clients` | List all clients |
| `GET` | `/admin/clients/{id}` | Client detail with usage stats |
| `PUT` | `/admin/clients/{id}/quota` | Update monthly response quota |
| `GET` | `/admin/dynata/jobs` | List active Dynata survey jobs |
| `GET` | `/admin/health` | Platform health indicators |

---

## Common Response Codes

| Code | Meaning |
|---|---|
| `200` | OK |
| `201` | Created |
| `202` | Accepted (async processing started) |
| `400` | Bad Request — validation error |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — insufficient role |
| `404` | Not Found |
| `429` | Too Many Requests — quota exceeded |
| `502` | Bad Gateway — Dynata API error |
| `500` | Internal Server Error |
