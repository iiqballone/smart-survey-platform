# ARCHITECTURE.md — System Architecture

## Overview

SurveyBridge follows a **decoupled, three-tier architecture** with a React frontend, a Java/Spring Boot backend, and Keycloak handling all identity and access management. Dynata is integrated as an external third-party panel via its REST API.

---

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│                  React Frontend (SPA)                           │
│   Login │ Survey Builder │ Dashboard │ Reports │ Settings       │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS (REST / JWT)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY / Load Balancer                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
          ┌──────────────▼──────────────┐
          │     Spring Boot Backend     │
          │                             │
          │  ┌──────────────────────┐   │
          │  │  Survey Service      │   │
          │  │  Response Service    │   │
          │  │  Client Service      │   │
          │  │  Dashboard Service   │   │
          │  │  Notification Svc    │   │
          │  └──────────────────────┘   │
          └───┬────────────┬────────────┘
              │            │
    ┌─────────▼──┐   ┌─────▼──────────────┐
    │ PostgreSQL │   │  Redis Cache/Queue  │
    │  (Primary  │   │                     │
    │   Store)   │   └─────────────────────┘
    └────────────┘
              │
    ┌─────────▼──────────────────────┐
    │       Kafka Message Bus        │
    │  (Response ingestion pipeline) │
    └─────────────────────────────────┘
              │
    ┌─────────▼──────────────────────┐
    │       Dynata Panel API         │
    │  (Survey distribution &        │
    │   response collection)         │
    └────────────────────────────────┘

    ┌────────────────────────────────┐
    │           Keycloak             │
    │  Identity & Access Management  │
    │  (OIDC / OAuth 2.0)            │
    └────────────────────────────────┘
```

---

## Component Descriptions

### 1. React Frontend
- Single Page Application (SPA) served via a CDN or Nginx
- Communicates exclusively with the Spring Boot backend via REST APIs
- Authenticates via Keycloak using the OIDC Authorization Code flow
- Receives a JWT access token that is passed as a Bearer token on every API call

### 2. API Gateway / Load Balancer
- Entry point for all HTTP traffic
- Handles SSL termination
- Routes requests to the appropriate backend service
- Validates JWT tokens (can be handled at gateway or backend level)

### 3. Spring Boot Backend
A monolith-first design with clearly separated service modules, designed to be split into microservices later if needed.

| Module | Responsibility |
|---|---|
| **Survey Service** | CRUD for surveys, question types, logic/branching |
| **Response Service** | Ingest and store responses from Dynata webhook/callback |
| **Client Service** | Manage client accounts, quotas, and preferences |
| **Dashboard Service** | Aggregate response data for dashboard queries |
| **Notification Service** | Email/webhook alerts for survey completion milestones |
| **Dynata Adapter** | All outbound calls to the Dynata API |

### 4. PostgreSQL
- Primary relational store for all persistent data
- Separate schemas per service domain for clean boundaries
- Row-level security for multi-tenancy (client isolation)

### 5. Redis
- Session caching and JWT token blacklisting
- Rate limiting counters
- Short-lived job queues for Dynata request retries

### 6. Kafka
- Decouples Dynata response ingestion from real-time dashboard updates
- Topics: `survey.dispatched`, `response.received`, `survey.completed`
- Allows replay and processing guarantees for high-volume response ingestion

### 7. Keycloak
- Manages authentication for all user types (Client users, Platform Admins)
- Issues JWT tokens consumed by the backend
- Enforces RBAC roles: `CLIENT_ADMIN`, `CLIENT_VIEWER`, `PLATFORM_ADMIN`

### 8. Dynata API (External)
- Receives survey payloads from SurveyBridge
- Distributes to its respondent panel
- Delivers responses back via webhooks or polling callbacks

---

## Data Flow — Survey Dispatch

```
1. Client creates survey on frontend
2. Frontend POST /surveys → Backend Survey Service
3. Backend saves survey to PostgreSQL
4. Backend calls Dynata Adapter → POST to Dynata API
5. Dynata returns a survey_id / project_id
6. Backend stores Dynata reference ID against the survey
7. Survey status set to LIVE
```

## Data Flow — Response Collection

```
1. Dynata respondent completes survey
2. Dynata fires webhook → Backend Response Service endpoint
3. Response Service validates webhook signature
4. Response published to Kafka topic: response.received
5. Kafka consumer persists response to PostgreSQL
6. Dashboard Service cache (Redis) invalidated / updated
7. Client dashboard reflects new response in real time (WebSocket or polling)
```

---

## Non-Functional Requirements

| Concern | Target |
|---|---|
| Availability | 99.9% uptime SLA |
| Response ingestion | Support up to 10,000 responses/minute via Kafka |
| Dashboard latency | < 2 seconds for dashboard load |
| Security | OWASP Top 10 compliance; all PII encrypted at rest |
| Multi-tenancy | Full client data isolation at DB and API layer |
