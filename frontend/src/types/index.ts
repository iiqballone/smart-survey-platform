// ─── Enums ───────────────────────────────────────────────────────────────────

export type SurveyStatus = 'DRAFT' | 'LIVE' | 'PAUSED' | 'COMPLETED';
export type QuestionType = 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'RATING' | 'OPEN_TEXT' | 'NPS' | 'MATRIX';
export type UserRole = 'CLIENT_ADMIN' | 'CLIENT_VIEWER' | 'PLATFORM_ADMIN';
export type ClientPlan = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
export type Gender = 'ALL' | 'MALE' | 'FEMALE';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  clientGroupId?: string;
}

// ─── Survey ───────────────────────────────────────────────────────────────────

export interface SurveyTargeting {
  country: string;
  ageMin: number;
  ageMax: number;
  gender: Gender;
  sampleSize: number;
  incidenceRate: number;
}

export interface QuestionOption {
  id: string;
  questionId: string;
  orderIndex: number;
  label: string;
  value: string;
}

export interface Question {
  id: string;
  surveyId: string;
  orderIndex: number;
  text: string;
  type: QuestionType;
  required: boolean;
  conditionalLogic?: string;
  options?: QuestionOption[];
}

export interface Survey {
  id: string;
  clientId: string;
  title: string;
  description: string;
  status: SurveyStatus;
  dynataProjectId?: string;
  targetResponseCount: number;
  receivedResponseCount: number;
  targeting?: SurveyTargeting;
  questions?: Question[];
  createdAt: string;
  publishedAt?: string;
  closedAt?: string;
}

export interface CreateSurveyRequest {
  title: string;
  description: string;
  targeting: SurveyTargeting;
  questions: Array<{
    text: string;
    type: QuestionType;
    required: boolean;
    options?: string[];
  }>;
}

// ─── Responses ────────────────────────────────────────────────────────────────

export interface Answer {
  questionId: string;
  questionText: string;
  value: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  dynataRespondentId: string;
  country: string;
  ageGroup: number;
  gender: string;
  completedAt: string;
  durationSeconds: number;
  answers: Answer[];
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  totalSurveys: number;
  activeSurveys: number;
  totalResponses: number;
  avgCompletionRate: number;
  responsesThisMonth: number;
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface CompletionRate {
  surveyId: string;
  title: string;
  completionRate: number;
  receivedResponseCount: number;
  targetResponseCount: number;
}

// ─── Clients (Admin) ──────────────────────────────────────────────────────────

export interface Client {
  id: string;
  name: string;
  contactEmail: string;
  plan: ClientPlan;
  monthlyResponseQuota: number;
  usedResponseCount: number;
  active: boolean;
  createdAt: string;
}

export interface ClientUser {
  id: string;
  clientId: string;
  keycloakUserId: string;
  email: string;
  role: 'CLIENT_ADMIN' | 'CLIENT_VIEWER';
  createdAt: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PagedResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
}
