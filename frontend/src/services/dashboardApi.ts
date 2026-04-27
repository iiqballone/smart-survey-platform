import api from './api';
import type { DashboardSummary, TimeSeriesPoint, CompletionRate } from '@/types';
import { MOCK_DASHBOARD, MOCK_TIMESERIES, MOCK_COMPLETION_RATES } from '@/mocks/data';

const DEV = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

export const dashboardApi = {
  summary: () => {
    if (DEV) return Promise.resolve(MOCK_DASHBOARD);
    return api.get<DashboardSummary>('/dashboard/summary').then(r => r.data);
  },

  timeSeries: (surveyId: string, from: string, to: string, granularity: 'day' | 'week' | 'month' = 'day') => {
    if (DEV) return Promise.resolve({ surveyId, data: MOCK_TIMESERIES });
    return api.get<{ surveyId: string; data: TimeSeriesPoint[] }>(
      `/dashboard/surveys/${surveyId}/timeseries`,
      { params: { from, to, granularity } },
    ).then(r => r.data);
  },

  completionRates: () => {
    if (DEV) return Promise.resolve(MOCK_COMPLETION_RATES);
    return api.get<CompletionRate[]>('/dashboard/completion-rates').then(r => r.data);
  },
};
