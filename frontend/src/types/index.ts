// ─── Enums ───────────────────────────────────────────────────────────────────

export type SurveyStatus = 'DRAFT' | 'LIVE' | 'PAUSED' | 'COMPLETED';
export type EventType    = 'COMPLETE' | 'SCREENOUT';
export type UserRole     = 'CLIENT_ADMIN' | 'CLIENT_VIEWER' | 'PLATFORM_ADMIN';
export type ClientPlan   = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  clientGroupId?: string;
}

// ─── Survey ───────────────────────────────────────────────────────────────────

export interface CpiRange {
  min: number;
  max: number;
}

export interface Survey {
  id: string;
  clientId: string;
  title: string;
  surveyUrl: string;
  fusionSurveyId?: string;
  fusionEntryUrl?: string;
  country: string;
  completesRequired: number;
  completedCount: number;
  screenoutCount: number;
  loi: number;
  cpiMin: number;
  cpiMax: number;
  callbackUrl: string;
  status: SurveyStatus;
  createdAt: string;
  publishedAt?: string;
  closedAt?: string;
}

export interface CreateSurveyRequest {
  title: string;
  surveyUrl: string;
  completesRequired: number;
  loi: number;
  country: string;
  cpiRange: CpiRange;
  callbackUrl: string;
}

// ─── Responses ────────────────────────────────────────────────────────────────

export interface SurveyResponse {
  id: string;
  surveyId: string;
  respondentId: string;
  fusionSurveyId: string;
  eventType: EventType;
  cpi?: number;
  occurredAt: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface TimeSeriesPoint {
  period: string;
  responses: number;
  completions: number;
}

export interface SurveyAnalytics {
  surveyId: string;
  completedCount: number;
  screenoutCount: number;
  completesRequired: number;
  completionRate: number;
  screenoutRate: number;
  averageCpi?: number;
  trend: TimeSeriesPoint[];
}

export interface SurveyPerformance {
  id: string;
  title: string;
  completedCount: number;
  completesRequired: number;
  completionRate: number;
  status: SurveyStatus;
}

export interface CrossSurveyAnalytics {
  responseTrend: TimeSeriesPoint[];
  surveyPerformance: SurveyPerformance[];
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  totalSurveys: number;
  activeSurveys: number;
  totalResponses: number;
  avgCompletionRate: number;
  responsesThisMonth: number;
}

export interface CompletionRate {
  surveyId: string;
  title: string;
  completionRate: number;
  completedCount: number;
  completesRequired: number;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotifLevel = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface NotificationDto {
  id: string;
  type: NotifLevel;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// ─── Team ─────────────────────────────────────────────────────────────────────

export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface TeamMember {
  id: string;
  email: string;
  role: TeamRole;
  createdAt: string;
}

export interface InviteRequest {
  email: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
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

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface FusionJob {
  fusionSurveyId: string;
  surveyTitle: string;
  state: 'LIVE' | 'PAUSED';
  completedCount: number;
  completesRequired: number;
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
