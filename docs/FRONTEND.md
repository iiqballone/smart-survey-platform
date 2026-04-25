# FRONTEND.md — Frontend Application Design

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 + TypeScript | Core framework |
| Vite | Build tooling |
| Tailwind CSS | Utility-first styling |
| React Router v6 | Client-side routing |
| TanStack Query | Server state management and caching |
| Zustand | Client state management |
| React Hook Form + Zod | Form handling and validation |
| Recharts | Dashboard charts and analytics |
| Keycloak-js | OIDC authentication |
| Axios | HTTP client |

---

## Application Structure

```
/src
├── assets/                  # Static images, icons, fonts
├── components/
│   ├── common/              # Reusable UI: Button, Input, Modal, Table
│   ├── layout/              # AppShell, Sidebar, TopNav, PageHeader
│   ├── survey/              # SurveyBuilder, QuestionCard, LogicEditor
│   ├── dashboard/           # StatsCard, ResponseChart, FilterBar
│   └── auth/                # ProtectedRoute, RoleGuard
├── hooks/                   # Custom React hooks
├── pages/                   # One file per route
│   ├── auth/                # Login, Callback
│   ├── surveys/             # SurveyList, SurveyCreate, SurveyDetail
│   ├── responses/           # ResponseViewer, ResponseExport
│   ├── dashboard/           # ClientDashboard, ReportView
│   ├── settings/            # Profile, TeamManagement, BillingSettings
│   └── admin/               # PlatformAdmin pages (internal only)
├── services/                # API call functions (per domain)
├── store/                   # Zustand stores
├── types/                   # TypeScript interfaces and enums
├── utils/                   # Helpers, formatters, validators
├── router.tsx               # Route definitions
└── main.tsx                 # App entry point, Keycloak init
```

---

## Pages and Routes

### Public / Auth Routes

| Route | Page | Description |
|---|---|---|
| `/login` | LoginPage | Redirects to Keycloak login |
| `/auth/callback` | AuthCallback | Handles Keycloak OIDC redirect |
| `/unauthorized` | UnauthorizedPage | Shown when role check fails |

### Client Routes (Role: `CLIENT_ADMIN` or `CLIENT_VIEWER`)

| Route | Page | Description |
|---|---|---|
| `/dashboard` | ClientDashboard | Overview — active surveys, response counts, completion rates |
| `/surveys` | SurveyList | All surveys with status, actions |
| `/surveys/new` | SurveyCreate | Survey builder — questions, logic, Dynata targeting |
| `/surveys/:id` | SurveyDetail | Survey summary, status, Dynata sync status |
| `/surveys/:id/edit` | SurveyEdit | Edit a draft survey |
| `/surveys/:id/responses` | ResponseViewer | Browse and filter all responses |
| `/surveys/:id/reports` | ReportView | Charts, cross-tabs, exportable summary |
| `/settings/profile` | ProfileSettings | Name, email, password |
| `/settings/team` | TeamManagement | Invite users, manage roles (CLIENT_ADMIN only) |

### Platform Admin Routes (Role: `PLATFORM_ADMIN`)

| Route | Page | Description |
|---|---|---|
| `/admin/clients` | ClientList | All client accounts |
| `/admin/clients/:id` | ClientDetail | Client surveys, usage, quotas |
| `/admin/dynata` | DynataMonitor | Dynata job queue, failed dispatches |
| `/admin/system` | SystemHealth | API health, Kafka lag, error rates |

---

## Key Components

### SurveyBuilder
The core creation experience. Supports:
- Multiple question types: Single choice, Multi choice, Rating scale, Open text, Matrix, NPS
- Drag-and-drop question reordering
- Conditional display logic (show question X if answer to Y is Z)
- Survey metadata: Title, description, estimated completion time
- Dynata targeting panel: Country, age range, gender, sample size, incidence rate

### ClientDashboard
- Top-level KPI cards: Total surveys, Active surveys, Total responses, Avg completion rate
- Line chart: Daily responses over time
- Bar chart: Completion rate by survey
- Status list: Recent survey activity

### ResponseViewer
- Paginated table of all responses
- Filter by: Date range, question answer, respondent metadata
- Individual response drilldown modal
- Bulk export as CSV / Excel

---

## Authentication Flow

```
1. App loads → Keycloak-js checks for valid session
2. No session → Redirect to Keycloak login page
3. User logs in → Keycloak issues auth code
4. App exchanges code → receives access_token + refresh_token
5. access_token stored in memory (NOT localStorage)
6. Axios interceptor attaches Bearer token to every request
7. Token silently refreshed before expiry via Keycloak-js
8. On logout → token revoked, session cleared
```

---

## Role-Based UI

| Element | CLIENT_VIEWER | CLIENT_ADMIN | PLATFORM_ADMIN |
|---|---|---|---|
| View dashboards | ✅ | ✅ | ✅ |
| Create surveys | ❌ | ✅ | ✅ |
| Edit surveys | ❌ | ✅ | ✅ |
| Manage team | ❌ | ✅ | ✅ |
| Access admin panel | ❌ | ❌ | ✅ |

---

## Design System Principles

- **Colour palette**: Primary `#2563EB` (blue), Neutral greys, Success green, Warning amber, Error red
- **Typography**: Inter font, consistent heading scale (h1–h4)
- **Spacing**: 4px base grid (Tailwind default)
- **Components**: All inputs, buttons, modals follow a consistent size/variant system (sm / md / lg)
- **Responsiveness**: Fully responsive — optimised for 1280px+ desktop; usable on tablet
- **Accessibility**: WCAG 2.1 AA — keyboard navigable, ARIA labels, sufficient contrast ratios
