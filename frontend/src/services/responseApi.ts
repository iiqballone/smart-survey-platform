import api from './api';
import type { SurveyResponse, PagedResult, PageParams } from '@/types';
import { MOCK_RESPONSES_PAGED } from '@/mocks/data';

const DEV = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

interface ResponseFilters extends PageParams { from?: string; to?: string }

export const responseApi = {
  list: (_surveyId: string, _params?: ResponseFilters) => {
    if (DEV) return Promise.resolve(MOCK_RESPONSES_PAGED);
    return api.get<PagedResult<SurveyResponse>>(`/surveys/${_surveyId}/responses`, { params: _params }).then(r => r.data);
  },

  exportUrl: (surveyId: string, format: 'csv' | 'excel') =>
    `${import.meta.env.VITE_API_BASE_URL ?? '/api/v1'}/surveys/${surveyId}/responses/export?format=${format}`,
};
