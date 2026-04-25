import api from './api';
import type { Client, PagedResult } from '@/types';
import { MOCK_CLIENTS } from '@/mocks/data';

const DEV = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

export const adminApi = {
  listClients: (_params?: { page?: number; size?: number }) => {
    if (DEV) return Promise.resolve(MOCK_CLIENTS);
    return api.get<PagedResult<Client>>('/admin/clients', { params: _params }).then(r => r.data);
  },

  getClient: (id: string) => {
    if (DEV) return Promise.resolve(MOCK_CLIENTS.content.find(c => c.id === id) ?? MOCK_CLIENTS.content[0]);
    return api.get<Client>(`/admin/clients/${id}`).then(r => r.data);
  },

  updateQuota: (id: string, quota: number) => {
    if (DEV) { console.log('DEV: update quota', id, quota); return Promise.resolve(); }
    return api.put(`/admin/clients/${id}/quota`, { monthlyResponseQuota: quota });
  },

  health: () => {
    if (DEV) return Promise.resolve({ status: 'UP', components: { postgres: { status: 'UP' }, redis: { status: 'UP' }, kafka: { status: 'UP' }, keycloak: { status: 'UP' } } });
    return api.get('/admin/health').then(r => r.data);
  },

  dynataJobs: () => {
    if (DEV) return Promise.resolve([
      { dynataProjectId: 'DYN-98765', title: 'Q2 Brand Perception Study',        syncStatus: 'SYNCED',      receivedResponseCount: 312, targetResponseCount: 500 },
      { dynataProjectId: 'DYN-98812', title: "Product Satisfaction – Spring '26", syncStatus: 'SYNCED',      receivedResponseCount: 88,  targetResponseCount: 200 },
      { dynataProjectId: 'DYN-97701', title: 'Ad Recall Test – Campaign V2',      syncStatus: 'PAUSED_SYNCED', receivedResponseCount: 145, targetResponseCount: 400 },
    ]);
    return api.get('/admin/dynata/jobs').then(r => r.data);
  },
};
