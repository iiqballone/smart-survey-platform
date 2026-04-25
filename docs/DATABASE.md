# DATABASE.md — Database Schema Design

## Database: PostgreSQL

All tables use UUID primary keys. Multi-tenancy is enforced via a `client_id` column on all core tables. Row-level security (RLS) policies are applied at the PostgreSQL level as a defence-in-depth measure.

---

## Entity Relationship Diagram (Text)

```
clients
  │
  ├──< surveys (client_id)
  │       │
  │       ├──< questions (survey_id)
  │       │       │
  │       │       └──< question_options (question_id)
  │       │
  │       └──< survey_responses (survey_id)
  │               │
  │               └──< answers (response_id, question_id)
  │
  └──< client_users (client_id)
```

---

## Table Definitions

### `clients`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `name` | VARCHAR(255) | |
| `keycloak_group_id` | VARCHAR(100) | Links to Keycloak group |
| `contact_email` | VARCHAR(255) | |
| `plan` | VARCHAR(50) | STARTER, PROFESSIONAL, ENTERPRISE |
| `monthly_response_quota` | INTEGER | |
| `used_response_count` | INTEGER | Resets monthly |
| `active` | BOOLEAN | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

---

### `client_users`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `client_id` | UUID FK → clients | |
| `keycloak_user_id` | VARCHAR(100) | |
| `email` | VARCHAR(255) | |
| `role` | VARCHAR(50) | CLIENT_ADMIN, CLIENT_VIEWER |
| `created_at` | TIMESTAMPTZ | |

---

### `surveys`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `client_id` | UUID FK → clients | Multi-tenancy key |
| `title` | VARCHAR(500) | |
| `description` | TEXT | |
| `status` | VARCHAR(50) | DRAFT, LIVE, PAUSED, COMPLETED |
| `dynata_project_id` | VARCHAR(100) | Returned by Dynata on publish |
| `target_response_count` | INTEGER | |
| `received_response_count` | INTEGER | Maintained by trigger/service |
| `targeting` | JSONB | `{ country, ageMin, ageMax, gender, sampleSize, incidenceRate }` |
| `created_at` | TIMESTAMPTZ | |
| `published_at` | TIMESTAMPTZ | |
| `closed_at` | TIMESTAMPTZ | |

Indexes:
- `(client_id, status)` — for filtered survey list queries
- `(dynata_project_id)` — for webhook lookup

---

### `questions`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `survey_id` | UUID FK → surveys | |
| `order_index` | INTEGER | Display order |
| `text` | TEXT | |
| `type` | VARCHAR(50) | SINGLE_CHOICE, MULTI_CHOICE, RATING, OPEN_TEXT, NPS, MATRIX |
| `required` | BOOLEAN | |
| `conditional_logic` | JSONB | `{ showIf: { questionId, operator, value } }` |

---

### `question_options`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `question_id` | UUID FK → questions | |
| `order_index` | INTEGER | |
| `label` | VARCHAR(500) | |
| `value` | VARCHAR(255) | Internal code value |

---

### `survey_responses`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `survey_id` | UUID FK → surveys | |
| `dynata_respondent_id` | VARCHAR(100) | Anonymised; no PII |
| `country` | CHAR(2) | ISO 3166-1 alpha-2 |
| `age_group` | INTEGER | Approximate age |
| `gender` | VARCHAR(20) | |
| `completed_at` | TIMESTAMPTZ | |
| `duration_seconds` | INTEGER | |

Indexes:
- `(survey_id)` — for response listing
- `(survey_id, completed_at)` — for time-series queries
- `(survey_id, country)` — for geographic breakdowns

---

### `answers`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `response_id` | UUID FK → survey_responses | |
| `question_id` | UUID FK → questions | |
| `value` | TEXT | Single value or JSON array for multi-select |

---

## Migrations Strategy

- **Flyway** manages all schema migrations
- Migration files named: `V{version}__{description}.sql`
- Example: `V1__create_clients_table.sql`
- Migrations run automatically on application startup
- Production migrations reviewed and approved before deployment

---

## Data Retention Policy

| Data | Retention |
|---|---|
| Survey definitions | Indefinite |
| Response data | 3 years (configurable per client plan) |
| Audit logs | 7 years |
| Deleted client data | Purged after 90-day grace period |
