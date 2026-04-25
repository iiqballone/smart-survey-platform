import type {
  Survey, SurveyResponse, DashboardSummary,
  TimeSeriesPoint, CompletionRate, Client, PagedResult,
} from '@/types';

export const MOCK_SURVEYS: Survey[] = [
  { id: '1', clientId: 'c1', title: 'Q2 Brand Perception Study',        description: '18–35 US audience',       status: 'LIVE',      receivedResponseCount: 312, targetResponseCount: 500, targeting: { country: 'US', ageMin: 18, ageMax: 35, gender: 'ALL', sampleSize: 500, incidenceRate: 60 }, createdAt: '2026-04-02T09:00:00Z', publishedAt: '2026-04-02T11:00:00Z', dynataProjectId: 'DYN-98765' },
  { id: '2', clientId: 'c1', title: "Product Satisfaction – Spring '26", description: 'Post-purchase feedback',  status: 'LIVE',      receivedResponseCount: 88,  targetResponseCount: 200, targeting: { country: 'GB', ageMin: 18, ageMax: 65, gender: 'ALL', sampleSize: 200, incidenceRate: 70 }, createdAt: '2026-04-10T09:00:00Z', publishedAt: '2026-04-10T10:00:00Z', dynataProjectId: 'DYN-98812' },
  { id: '3', clientId: 'c1', title: 'Competitor Awareness Survey',       description: 'General consumer panel', status: 'DRAFT',     receivedResponseCount: 0,   targetResponseCount: 300, targeting: { country: 'US', ageMin: 25, ageMax: 55, gender: 'ALL', sampleSize: 300, incidenceRate: 50 }, createdAt: '2026-04-18T09:00:00Z' },
  { id: '4', clientId: 'c1', title: 'Ad Recall Test – Campaign V2',      description: 'Exposed vs. control',    status: 'PAUSED',    receivedResponseCount: 145, targetResponseCount: 400, targeting: { country: 'CA', ageMin: 18, ageMax: 50, gender: 'ALL', sampleSize: 400, incidenceRate: 45 }, createdAt: '2026-03-15T09:00:00Z', publishedAt: '2026-03-15T12:00:00Z', dynataProjectId: 'DYN-97701' },
  { id: '5', clientId: 'c1', title: 'NPS Benchmark 2025',                description: 'Annual loyalty tracker', status: 'COMPLETED', receivedResponseCount: 600, targetResponseCount: 600, targeting: { country: 'AU', ageMin: 18, ageMax: 70, gender: 'ALL', sampleSize: 600, incidenceRate: 80 }, createdAt: '2026-01-05T09:00:00Z', publishedAt: '2026-01-05T10:00:00Z', dynataProjectId: 'DYN-95500' },
];

export const MOCK_SURVEYS_PAGED: PagedResult<Survey> = {
  content: MOCK_SURVEYS,
  totalElements: MOCK_SURVEYS.length,
  totalPages: 1,
  page: 0,
  size: 20,
};

export const MOCK_RESPONSES: SurveyResponse[] = [
  { id: 'R-0021', surveyId: '1', dynataRespondentId: 'anon-001', country: 'US', gender: 'Female', ageGroup: 27, completedAt: '2026-04-25T09:12:00Z', durationSeconds: 154, answers: [{ questionId: 'q1', questionText: 'How familiar are you with our brand?', value: 'Very familiar' }, { questionId: 'q2', questionText: 'Rate your satisfaction (1–10)', value: '8' }, { questionId: 'q3', questionText: 'Would you recommend us?', value: 'Yes, definitely' }, { questionId: 'q4', questionText: 'Any additional comments?', value: 'Great product, really happy with the service.' }] },
  { id: 'R-0020', surveyId: '1', dynataRespondentId: 'anon-002', country: 'US', gender: 'Male',   ageGroup: 31, completedAt: '2026-04-25T08:55:00Z', durationSeconds: 181, answers: [{ questionId: 'q1', questionText: 'How familiar are you with our brand?', value: 'Somewhat familiar' }, { questionId: 'q2', questionText: 'Rate your satisfaction (1–10)', value: '7' }, { questionId: 'q3', questionText: 'Would you recommend us?', value: 'Maybe' }, { questionId: 'q4', questionText: 'Any additional comments?', value: 'Good but could improve delivery times.' }] },
  { id: 'R-0019', surveyId: '1', dynataRespondentId: 'anon-003', country: 'US', gender: 'Female', ageGroup: 24, completedAt: '2026-04-24T22:44:00Z', durationSeconds: 132, answers: [{ questionId: 'q1', questionText: 'How familiar are you with our brand?', value: 'Not familiar' }, { questionId: 'q2', questionText: 'Rate your satisfaction (1–10)', value: '9' }, { questionId: 'q3', questionText: 'Would you recommend us?', value: 'Yes, definitely' }, { questionId: 'q4', questionText: 'Any additional comments?', value: 'Excellent experience overall!' }] },
  { id: 'R-0018', surveyId: '1', dynataRespondentId: 'anon-004', country: 'US', gender: 'Male',   ageGroup: 29, completedAt: '2026-04-24T21:30:00Z', durationSeconds: 258, answers: [{ questionId: 'q1', questionText: 'How familiar are you with our brand?', value: 'Very familiar' }, { questionId: 'q2', questionText: 'Rate your satisfaction (1–10)', value: '6' }, { questionId: 'q3', questionText: 'Would you recommend us?', value: 'Not sure' }, { questionId: 'q4', questionText: 'Any additional comments?', value: 'Pricing could be more competitive.' }] },
  { id: 'R-0017', surveyId: '1', dynataRespondentId: 'anon-005', country: 'US', gender: 'Non-binary', ageGroup: 33, completedAt: '2026-04-24T19:08:00Z', durationSeconds: 176, answers: [{ questionId: 'q1', questionText: 'How familiar are you with our brand?', value: 'Very familiar' }, { questionId: 'q2', questionText: 'Rate your satisfaction (1–10)', value: '10' }, { questionId: 'q3', questionText: 'Would you recommend us?', value: 'Yes, definitely' }, { questionId: 'q4', questionText: 'Any additional comments?', value: 'Love everything about this brand.' }] },
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
  { date: 'Apr 1',  count: 24  }, { date: 'Apr 5',  count: 58  },
  { date: 'Apr 9',  count: 43  }, { date: 'Apr 13', count: 89  },
  { date: 'Apr 17', count: 67  }, { date: 'Apr 21', count: 112 },
  { date: 'Apr 25', count: 95  },
];

export const MOCK_COMPLETION_RATES: CompletionRate[] = [
  { surveyId: '1', title: 'Q2 Brand',    completionRate: 71, receivedResponseCount: 312, targetResponseCount: 500 },
  { surveyId: '2', title: 'Product Sat.',completionRate: 84, receivedResponseCount: 88,  targetResponseCount: 200 },
  { surveyId: '4', title: 'Ad Recall',   completionRate: 62, receivedResponseCount: 145, targetResponseCount: 400 },
  { surveyId: '5', title: 'NPS 2025',    completionRate: 93, receivedResponseCount: 600, targetResponseCount: 600 },
];

export const MOCK_CLIENTS: PagedResult<Client> = {
  content: [
    { id: 'c1', name: 'Acme Corporation',  contactEmail: 'jane@acmecorp.com',   plan: 'PROFESSIONAL', monthlyResponseQuota: 5000, usedResponseCount: 3241, active: true,  createdAt: '2026-01-10T00:00:00Z' },
    { id: 'c2', name: 'Globex Research',   contactEmail: 'ops@globex.io',       plan: 'ENTERPRISE',   monthlyResponseQuota: 20000, usedResponseCount: 8100, active: true,  createdAt: '2026-02-01T00:00:00Z' },
    { id: 'c3', name: 'Initech Analytics', contactEmail: 'admin@initech.com',   plan: 'STARTER',      monthlyResponseQuota: 500,  usedResponseCount: 210,  active: true,  createdAt: '2026-03-15T00:00:00Z' },
    { id: 'c4', name: 'Umbrella Insights', contactEmail: 'survey@umbrella.com', plan: 'PROFESSIONAL', monthlyResponseQuota: 5000, usedResponseCount: 0,    active: false, createdAt: '2026-04-01T00:00:00Z' },
  ],
  totalElements: 4, totalPages: 1, page: 0, size: 20,
};
