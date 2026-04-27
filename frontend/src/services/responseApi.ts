import api from './api';
import type { SurveyResponse, PagedResult, PageParams } from '@/types';
import { MOCK_RESPONSES_PAGED } from '@/mocks/data';

const DEV = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

interface ResponseFilters extends PageParams { from?: string; to?: string }

export const responseApi = {
  list: (surveyId: string, _params?: ResponseFilters) => {
    if (DEV) return Promise.resolve(MOCK_RESPONSES_PAGED);
    return api.get<PagedResult<SurveyResponse>>(`/surveys/${surveyId}/responses`, { params: _params }).then(r => r.data);
  },

  export: async (surveyId: string, format: 'csv' | 'excel') => {
    if (DEV) {
      alert(`DEV: export ${format} for survey ${surveyId}`);
      return;
    }
    const mimeType = format === 'csv'
      ? 'text/csv'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const ext = format === 'csv' ? 'csv' : 'xlsx';

    const response = await api.get(`/surveys/${surveyId}/responses/export`, {
      params: { format },
      responseType: 'blob',
    });

    const url  = URL.createObjectURL(new Blob([response.data], { type: mimeType }));
    const link = document.createElement('a');
    link.href     = url;
    link.download = `responses-${surveyId}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
