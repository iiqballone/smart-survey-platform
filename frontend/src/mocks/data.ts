import type {
  Survey, SurveyResponse, DashboardSummary,
  TimeSeriesPoint, CompletionRate, Client, PagedResult,
  NotificationDto, TeamMember, FusionJob,
} from '@/types';

export const MOCK_SURVEYS: Survey[] = [
  {
    id: '1', clientId: 'c1',
    title: 'Q2 Brand Perception Study',
    surveyUrl: 'https://www.surveymonkey.com/r/ABC123?rid={rid}',
    fusionSurveyId: 'FS-1A2B3C4D', fusionEntryUrl: 'https://fusion.spectrumsurveys.com/start-universal/1A2B3C4D',
    country: 'US', completesRequired: 500, completedCount: 312, screenoutCount: 87,
    loi: 10, cpiMin: 2.72, cpiMax: 3.68, callbackUrl: 'https://client.com/webhooks/surveybridge',
    status: 'LIVE', createdAt: '2026-04-02T09:00:00Z', publishedAt: '2026-04-02T11:00:00Z',
  },
  {
    id: '2', clientId: 'c1',
    title: "Product Satisfaction – Spring '26",
    surveyUrl: 'https://www.surveymonkey.com/r/DEF456?rid={rid}',
    fusionSurveyId: 'FS-2B3C4D5E', fusionEntryUrl: 'https://fusion.spectrumsurveys.com/start-universal/2B3C4D5E',
    country: 'GB', completesRequired: 200, completedCount: 88, screenoutCount: 22,
    loi: 8, cpiMin: 3.83, cpiMax: 5.18, callbackUrl: 'https://client.com/webhooks/surveybridge',
    status: 'LIVE', createdAt: '2026-04-10T09:00:00Z', publishedAt: '2026-04-10T10:00:00Z',
  },
  {
    id: '3', clientId: 'c1',
    title: 'Competitor Awareness Survey',
    surveyUrl: 'https://www.surveymonkey.com/r/GHI789?rid={rid}',
    country: 'US', completesRequired: 300, completedCount: 0, screenoutCount: 0,
    loi: 12, cpiMin: 2.10, cpiMax: 2.84, callbackUrl: 'https://client.com/webhooks/surveybridge',
    status: 'DRAFT', createdAt: '2026-04-18T09:00:00Z',
  },
  {
    id: '4', clientId: 'c1',
    title: 'Ad Recall Test – Campaign V2',
    surveyUrl: 'https://www.surveymonkey.com/r/JKL012?rid={rid}',
    fusionSurveyId: 'FS-4D5E6F7G', fusionEntryUrl: 'https://fusion.spectrumsurveys.com/start-universal/4D5E6F7G',
    country: 'CA', completesRequired: 400, completedCount: 145, screenoutCount: 61,
    loi: 15, cpiMin: 2.98, cpiMax: 4.03, callbackUrl: 'https://client.com/webhooks/surveybridge',
    status: 'PAUSED', createdAt: '2026-03-15T09:00:00Z', publishedAt: '2026-03-15T12:00:00Z',
  },
  {
    id: '5', clientId: 'c1',
    title: 'NPS Benchmark 2025',
    surveyUrl: 'https://www.surveymonkey.com/r/MNO345?rid={rid}',
    fusionSurveyId: 'FS-5E6F7G8H', fusionEntryUrl: 'https://fusion.spectrumsurveys.com/start-universal/5E6F7G8H',
    country: 'AU', completesRequired: 600, completedCount: 600, screenoutCount: 120,
    loi: 7, cpiMin: 4.08, cpiMax: 5.52, callbackUrl: 'https://client.com/webhooks/surveybridge',
    status: 'COMPLETED', createdAt: '2026-01-05T09:00:00Z', publishedAt: '2026-01-05T10:00:00Z', closedAt: '2026-02-15T00:00:00Z',
  },
];

export const MOCK_SURVEYS_PAGED: PagedResult<Survey> = {
  content: MOCK_SURVEYS,
  totalElements: MOCK_SURVEYS.length,
  totalPages: 1,
  page: 0,
  size: 20,
};

export const MOCK_RESPONSES: SurveyResponse[] = [
  { id: 'R-0021', surveyId: '1', respondentId: 'R-anon-001', fusionSurveyId: 'FS-1A2B3C4D', eventType: 'COMPLETE', cpi: 3.20, occurredAt: '2026-04-25T09:12:00Z' },
  { id: 'R-0020', surveyId: '1', respondentId: 'R-anon-002', fusionSurveyId: 'FS-1A2B3C4D', eventType: 'COMPLETE', cpi: 3.15, occurredAt: '2026-04-25T08:55:00Z' },
  { id: 'R-0019', surveyId: '1', respondentId: 'R-anon-003', fusionSurveyId: 'FS-1A2B3C4D', eventType: 'SCREENOUT',          occurredAt: '2026-04-24T22:44:00Z' },
  { id: 'R-0018', surveyId: '1', respondentId: 'R-anon-004', fusionSurveyId: 'FS-1A2B3C4D', eventType: 'COMPLETE', cpi: 3.50, occurredAt: '2026-04-24T21:30:00Z' },
  { id: 'R-0017', surveyId: '1', respondentId: 'R-anon-005', fusionSurveyId: 'FS-1A2B3C4D', eventType: 'COMPLETE', cpi: 2.90, occurredAt: '2026-04-24T19:08:00Z' },
];

export const MOCK_RESPONSES_PAGED: PagedResult<SurveyResponse> = {
  content: MOCK_RESPONSES,
  totalElements: 312,
  totalPages: 16,
  page: 0,
  size: 20,
};

export const MOCK_DASHBOARD: DashboardSummary = {
  totalSurveys: 5,
  activeSurveys: 2,
  totalResponses: 1145,
  avgCompletionRate: 77,
  responsesThisMonth: 400,
};

export const MOCK_TIMESERIES: TimeSeriesPoint[] = [
  { period: '2026-04-01', responses: 28,  completions: 19  },
  { period: '2026-04-05', responses: 65,  completions: 44  },
  { period: '2026-04-09', responses: 51,  completions: 38  },
  { period: '2026-04-13', responses: 97,  completions: 72  },
  { period: '2026-04-17', responses: 79,  completions: 58  },
  { period: '2026-04-21', responses: 125, completions: 93  },
  { period: '2026-04-25', responses: 107, completions: 80  },
];

export const MOCK_COMPLETION_RATES: CompletionRate[] = [
  { surveyId: '1', title: 'Q2 Brand',    completionRate: 71, completedCount: 312, completesRequired: 500 },
  { surveyId: '2', title: 'Product Sat.',completionRate: 84, completedCount: 88,  completesRequired: 200 },
  { surveyId: '4', title: 'Ad Recall',   completionRate: 62, completedCount: 145, completesRequired: 400 },
  { surveyId: '5', title: 'NPS 2025',    completionRate: 93, completedCount: 600, completesRequired: 600 },
];

export const MOCK_CLIENTS: PagedResult<Client> = {
  content: [
    { id: 'c1', name: 'Acme Corporation',  contactEmail: 'jane@acmecorp.com',   plan: 'PROFESSIONAL', monthlyResponseQuota: 5000,  usedResponseCount: 3241, active: true,  createdAt: '2026-01-10T00:00:00Z' },
    { id: 'c2', name: 'Globex Research',   contactEmail: 'ops@globex.io',       plan: 'ENTERPRISE',   monthlyResponseQuota: 20000, usedResponseCount: 8100, active: true,  createdAt: '2026-02-01T00:00:00Z' },
    { id: 'c3', name: 'Initech Analytics', contactEmail: 'admin@initech.com',   plan: 'STARTER',      monthlyResponseQuota: 500,   usedResponseCount: 210,  active: true,  createdAt: '2026-03-15T00:00:00Z' },
    { id: 'c4', name: 'Umbrella Insights', contactEmail: 'survey@umbrella.com', plan: 'PROFESSIONAL', monthlyResponseQuota: 5000,  usedResponseCount: 0,    active: false, createdAt: '2026-04-01T00:00:00Z' },
  ],
  totalElements: 4, totalPages: 1, page: 0, size: 20,
};

export const MOCK_NOTIFICATIONS: NotificationDto[] = [
  { id: 'n1', type: 'SUCCESS', title: 'Survey quota reached',     body: 'NPS Benchmark 2025 collected all 600 responses.',                        link: '/surveys/5/reports', read: false, createdAt: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: 'n2', type: 'INFO',    title: 'Milestone — 50% complete', body: 'Q2 Brand Perception Study hit 250/500 responses.',                        link: '/surveys/1',         read: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'n3', type: 'WARNING', title: 'Quota at 78%',             body: 'You have used 3,900 / 5,000 monthly responses. Upgrade to avoid limits.', link: '/billing',           read: false, createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'n4', type: 'WARNING', title: 'Fusion survey paused',     body: 'Ad Recall Test – Campaign V2 paused by Fusion: low IR detected.',         link: '/surveys/4',         read: true,  createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: 'n5', type: 'INFO',    title: 'Team member joined',       body: 'bob@acme.com accepted your invitation as Viewer.',                        link: '/team',              read: true,  createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
];

export const MOCK_TEAM: TeamMember[] = [
  { id: '1', email: 'alice@acme.com',  role: 'OWNER',  createdAt: '2026-01-10T00:00:00Z' },
  { id: '2', email: 'bob@acme.com',    role: 'ADMIN',  createdAt: '2026-02-01T00:00:00Z' },
  { id: '3', email: 'carol@acme.com',  role: 'VIEWER', createdAt: '2026-03-15T00:00:00Z' },
];

export const MOCK_FUSION_JOBS: FusionJob[] = [
  { fusionSurveyId: 'FS-1A2B3C4D', surveyTitle: 'Q2 Brand Perception Study',        state: 'LIVE',   completedCount: 312, completesRequired: 500 },
  { fusionSurveyId: 'FS-2B3C4D5E', surveyTitle: "Product Satisfaction – Spring '26", state: 'LIVE',   completedCount: 88,  completesRequired: 200 },
  { fusionSurveyId: 'FS-4D5E6F7G', surveyTitle: 'Ad Recall Test – Campaign V2',      state: 'PAUSED', completedCount: 145, completesRequired: 400 },
];
