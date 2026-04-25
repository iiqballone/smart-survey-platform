# SurveyBridge Platform — Project Overview

## What Is SurveyBridge?

SurveyBridge is a modern, multi-tenant survey distribution and insights platform. It acts as the bridge between **clients** who need survey data and **Dynata**, a third-party respondent panel that delivers real end-user responses at scale.

---

## High-Level Flow

```
Client
  │
  │  1. Uploads / creates survey
  ▼
SurveyBridge Platform  ──────────────────►  Dynata Panel
  │                        2. Forwards survey      │
  │                                                │ 3. Collects responses
  │◄───────────────────────────────────────────────┘
  │  4. Aggregates responses
  │
  ▼
Client Dashboard
  (Real-time analytics, response viewer, exports)
```

---

## Key Actors

| Actor | Description |
|---|---|
| **Client** | Organisation that commissions surveys; accesses dashboards |
| **End User / Respondent** | Member of the Dynata panel who completes surveys |
| **Platform Admin** | Internal team managing clients, quotas, and platform health |
| **Dynata** | Third-party panel provider that distributes surveys and returns responses |

---

## Product Goals

- **Robust** — High availability, fault-tolerant survey distribution and response ingestion
- **Modern** — Clean, responsive UI with real-time dashboard updates
- **Secure** — Role-based access control via Keycloak; no cross-client data leakage
- **Scalable** — Handles concurrent surveys from multiple clients and bulk response ingestion

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend | React (TypeScript), Tailwind CSS |
| Backend | Java (Spring Boot) |
| Auth | Keycloak (OIDC / OAuth 2.0) |
| Database | PostgreSQL (primary), Redis (caching/queues) |
| Messaging | Apache Kafka (response ingestion pipeline) |
| Third-party | Dynata API |
| Deployment | Docker + Kubernetes |

---

## Repository Structure

```
smart-survey-platform/
├── docs/                        # Design documents (you are here)
├── frontend/                    # React + TypeScript SPA
│   ├── public/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── features/
│       ├── hooks/
│       ├── services/
│       ├── store/
│       ├── types/
│       └── utils/
├── backend/                     # Spring Boot API
│   └── src/
│       ├── main/java/com/surveybridge/
│       │   ├── config/
│       │   ├── controller/
│       │   ├── service/
│       │   ├── repository/
│       │   ├── model/
│       │   ├── dto/
│       │   ├── integration/
│       │   ├── kafka/
│       │   ├── security/
│       │   └── exception/
│       └── main/resources/
│           └── db/migration/
├── infra/                       # Docker, Kubernetes, scripts
│   ├── docker/
│   ├── k8s/
│   └── scripts/
└── .github/workflows/           # CI/CD pipelines
```

---

## Document Index

| File | Description |
|---|---|
| `ARCHITECTURE.md` | Full system architecture and component diagram |
| `FRONTEND.md` | Frontend app structure, pages, and component design |
| `BACKEND.md` | Backend service design, modules, and Java package structure |
| `API.md` | REST API contract between frontend and backend |
| `DYNATA_INTEGRATION.md` | Integration design with the Dynata panel API |
| `DATABASE.md` | Database schema and entity relationships |
| `AUTH.md` | Keycloak setup, roles, and token flow |
| `DEPLOYMENT.md` | Infrastructure, Docker, and CI/CD pipeline |
