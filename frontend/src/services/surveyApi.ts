import api from './api';
import type { Survey, CreateSurveyRequest, PagedResult, PageParams } from '@/types';
import { MOCK_SURVEYS, MOCK_SURVEYS_PAGED } from '@/mocks/data';

const DEV = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

let localSurveys = [...MOCK_SURVEYS];

export const surveyApi = {
  list: (_params?: PageParams & { status?: string }) => {
    if (DEV) {
      const filtered = _params?.status
        ? localSurveys.filter(s => s.status === _params.status)
        : localSurveys;
      return Promise.resolve({ ...MOCK_SURVEYS_PAGED, content: filtered, totalElements: filtered.length });
    }
    return api.get<PagedResult<Survey>>('/surveys', { params: _params }).then(r => r.data);
  },

  get: (id: string) => {
    if (DEV) {
      const s = localSurveys.find(s => s.id === id);
      return s ? Promise.resolve(s) : Promise.reject(new Error('Not found'));
    }
    return api.get<Survey>(`/surveys/${id}`).then(r => r.data);
  },

  create: (data: CreateSurveyRequest) => {
    if (DEV) {
      const s: Survey = {
        id: String(Date.now()), clientId: 'c1',
        title: data.title, description: data.description,
        status: 'DRAFT', receivedResponseCount: 0,
        targetResponseCount: data.targeting.sampleSize,
        targeting: data.targeting, createdAt: new Date().toISOString(),
      };
      localSurveys = [s, ...localSurveys];
      return Promise.resolve(s);
    }
    return api.post<Survey>('/surveys', data).then(r => r.data);
  },

  update: (id: string, data: Partial<CreateSurveyRequest>) => {
    if (DEV) {
      localSurveys = localSurveys.map(s => s.id === id ? { ...s, ...data } : s);
      return Promise.resolve(localSurveys.find(s => s.id === id)!);
    }
    return api.put<Survey>(`/surveys/${id}`, data).then(r => r.data);
  },

  delete: (id: string) => {
    if (DEV) { localSurveys = localSurveys.filter(s => s.id !== id); return Promise.resolve(); }
    return api.delete(`/surveys/${id}`);
  },

  publish: (id: string) => {
    if (DEV) {
      localSurveys = localSurveys.map(s => s.id === id ? { ...s, status: 'LIVE' as const, dynataProjectId: `DYN-${Date.now()}`, publishedAt: new Date().toISOString() } : s);
      return Promise.resolve(localSurveys.find(s => s.id === id)!);
    }
    return api.post<Survey>(`/surveys/${id}/publish`).then(r => r.data);
  },

  pause: (id: string) => {
    if (DEV) {
      localSurveys = localSurveys.map(s => s.id === id ? { ...s, status: 'PAUSED' as const } : s);
      return Promise.resolve(localSurveys.find(s => s.id === id)!);
    }
    return api.post<Survey>(`/surveys/${id}/pause`).then(r => r.data);
  },

  close: (id: string) => {
    if (DEV) {
      localSurveys = localSurveys.map(s => s.id === id ? { ...s, status: 'COMPLETED' as const, closedAt: new Date().toISOString() } : s);
      return Promise.resolve(localSurveys.find(s => s.id === id)!);
    }
    return api.post<Survey>(`/surveys/${id}/close`).then(r => r.data);
  },
};
