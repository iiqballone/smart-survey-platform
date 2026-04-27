import api from './api';
import type { Client, FusionJob, PagedResult } from '@/types';
import { MOCK_CLIENTS, MOCK_FUSION_JOBS } from '@/mocks/data';

const DEV = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

interface HealthStatus {
  status: 'UP' | 'DEGRADED';
  components: Record<string, { status: 'UP' | 'DOWN' }>;
}

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
    if (DEV) return Promise.resolve<HealthStatus>({ status: 'UP', components: { postgres: { status: 'UP' }, redis: { status: 'UP' }, kafka: { status: 'UP' }, keycloak: { status: 'UP' } } });
    return api.get<HealthStatus>('/admin/health').then(r => r.data);
  },

  fusionJobs: () => {
    if (DEV) return Promise.resolve(MOCK_FUSION_JOBS);
    return api.get<FusionJob[]>('/admin/fusion/jobs').then(r => r.data);
  },
};
