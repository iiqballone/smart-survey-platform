import api from './api';
import type { SurveyAnalytics, CrossSurveyAnalytics } from '@/types';
import { MOCK_TIMESERIES, MOCK_SURVEYS, MOCK_COMPLETION_RATES } from '@/mocks/data';

const DEV = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

export const analyticsApi = {
  surveyAnalytics: (id: string) => {
    if (DEV) {
      const survey = MOCK_SURVEYS.find(s => s.id === id) ?? MOCK_SURVEYS[0];
      const total = survey.completedCount + survey.screenoutCount;
      const result: SurveyAnalytics = {
        surveyId: id,
        completedCount: survey.completedCount,
        screenoutCount: survey.screenoutCount,
        completesRequired: survey.completesRequired,
        completionRate: survey.completesRequired > 0 ? (survey.completedCount / survey.completesRequired) * 100 : 0,
        screenoutRate: total > 0 ? (survey.screenoutCount / total) * 100 : 0,
        averageCpi: (survey.cpiMin + survey.cpiMax) / 2,
        trend: MOCK_TIMESERIES,
      };
      return Promise.resolve(result);
    }
    return api.get<SurveyAnalytics>(`/surveys/${id}/analytics`).then(r => r.data);
  },

  crossSurveyAnalytics: () => {
    if (DEV) {
      const result: CrossSurveyAnalytics = {
        responseTrend: MOCK_TIMESERIES,
        surveyPerformance: MOCK_SURVEYS.filter(s => s.status !== 'DRAFT').map(s => ({
          id: s.id,
          title: s.title,
          completedCount: s.completedCount,
          completesRequired: s.completesRequired,
          completionRate: MOCK_COMPLETION_RATES.find(r => r.surveyId === s.id)?.completionRate ?? 0,
          status: s.status,
        })),
      };
      return Promise.resolve(result);
    }
    return api.get<CrossSurveyAnalytics>('/analytics/summary').then(r => r.data);
  },
};
