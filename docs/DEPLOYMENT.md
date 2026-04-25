# DEPLOYMENT.md — Infrastructure & Deployment Design

## Overview

SurveyBridge is containerised using Docker and deployed on Kubernetes. Infrastructure is defined as code using Helm charts. CI/CD is managed via GitHub Actions.

---

## Environment Strategy

| Environment | Purpose | URL Pattern |
|---|---|---|
| `development` | Local developer machines | `localhost` |
| `staging` | Pre-production testing; mirrors prod | `staging.surveybridge.io` |
| `production` | Live environment | `surveybridge.io` |

---

## Docker Setup

### Services

| Service | Image | Port |
|---|---|---|
| `frontend` | `nginx:alpine` (serves React build) | 80 |
| `backend` | `eclipse-temurin:21-jre` | 8080 |
| `keycloak` | `quay.io/keycloak/keycloak:24` | 8180 |
| `postgres` | `postgres:16` | 5432 |
| `redis` | `redis:7-alpine` | 6379 |
| `kafka` | `confluentinc/cp-kafka:7.6` | 9092 |
| `zookeeper` | `confluentinc/cp-zookeeper:7.6` | 2181 |

### `docker-compose.yml` (Development)
```yaml
version: '3.9'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: surveybridge
      POSTGRES_USER: sb_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  keycloak:
    image: quay.io/keycloak/keycloak:24
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/surveybridge
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: ${KC_ADMIN_PASSWORD}
    command: start-dev

  backend:
    build: ./backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/surveybridge
      SPRING_REDIS_HOST: redis
      DYNATA_API_KEY: ${DYNATA_API_KEY}
      DYNATA_WEBHOOK_SECRET: ${DYNATA_WEBHOOK_SECRET}
    ports:
      - "8080:8080"
    depends_on: [postgres, redis, keycloak]

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on: [backend]

volumes:
  pgdata:
```

---

## Kubernetes Architecture (Production)

```
Internet
    │
    ▼
[ Ingress Controller (Nginx) ]
    │           │           │
    ▼           ▼           ▼
[Frontend]  [Backend]  [Keycloak]
 Deployment  Deployment  StatefulSet
    │
    ▼
[PostgreSQL StatefulSet]  [Redis Deployment]  [Kafka StatefulSet]
```

### Resource Estimates (Production Baseline)

| Service | Replicas | CPU Request | Memory Request |
|---|---|---|---|
| Frontend | 2 | 100m | 128Mi |
| Backend | 3 | 500m | 512Mi |
| Keycloak | 2 | 500m | 1Gi |
| PostgreSQL | 1 primary + 1 replica | 1000m | 2Gi |
| Redis | 1 | 200m | 256Mi |
| Kafka | 3 brokers | 1000m | 2Gi |

---

## CI/CD Pipeline (GitHub Actions)

### Frontend Pipeline
```
Push to main
    │
    ├── Lint + TypeScript check
    ├── Unit tests (Vitest)
    ├── Build (Vite)
    ├── Docker build + push to registry
    └── Deploy to staging (kubectl rollout)
            │
            └── Manual approval → Deploy to production
```

### Backend Pipeline
```
Push to main
    │
    ├── Compile (Maven)
    ├── Unit tests (JUnit 5)
    ├── Integration tests (Testcontainers)
    ├── Static analysis (SonarQube)
    ├── Docker build + push to registry
    └── Deploy to staging
            │
            └── Manual approval → Deploy to production
```

---

## Secrets Management

All secrets are stored in **Kubernetes Secrets** (or HashiCorp Vault for production):
- `DB_PASSWORD`
- `DYNATA_API_KEY`
- `DYNATA_WEBHOOK_SECRET`
- `KC_ADMIN_PASSWORD`

No secrets are stored in code repositories or Docker images.

---

## Monitoring & Observability

| Tool | Purpose |
|---|---|
| Prometheus | Metrics collection from Spring Boot Actuator |
| Grafana | Dashboards for API latency, error rates, Kafka lag |
| ELK Stack | Centralised logging (Elasticsearch, Logstash, Kibana) |
| Spring Boot Actuator | `/health`, `/metrics`, `/info` endpoints |
| Sentry | Frontend error tracking |
| PagerDuty | On-call alerting for P1/P2 incidents |

### Key Alerts
- Backend error rate > 1% → P2 alert
- Kafka consumer lag > 10,000 messages → P2 alert
- Dynata sync failure → P2 alert
- PostgreSQL replication lag > 30s → P1 alert
- Keycloak down → P1 alert
