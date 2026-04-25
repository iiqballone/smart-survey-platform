import api from './api';
import type { DashboardSummary, TimeSeriesPoint, CompletionRate } from '@/types';
import { MOCK_DASHBOARD, MOCK_TIMESERIES, MOCK_COMPLETION_RATES } from '@/mocks/data';

const DEV = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

export const dashboardApi = {
  summary: () => {
    if (DEV) return Promise.resolve(MOCK_DASHBOARD);
    return api.get<DashboardSummary>('/dashboard/summary').then(r => r.data);
  },

  timeSeries: (_surveyId: string, _from: string, _to: string, _granularity: 'day' | 'week' = 'day') => {
    if (DEV) return Promise.resolve({ surveyId: _surveyId, data: MOCK_TIMESERIES });
    return api.get<{ surveyId: string; data: TimeSeriesPoint[] }>(
      `/dashboard/surveys/${_surveyId}/timeseries`,
      { params: { from: _from, to: _to, granularity: _granularity } },
    ).then(r => r.data);
  },

  completionRates: () => {
    if (DEV) return Promise.resolve(MOCK_COMPLETION_RATES);
    return api.get<CompletionRate[]>('/dashboard/completion-rates').then(r => r.data);
  },
};
