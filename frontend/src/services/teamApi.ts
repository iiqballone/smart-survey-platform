import api from './api';
import type { TeamMember, InviteRequest } from '@/types';
import { MOCK_TEAM } from '@/mocks/data';

const DEV = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

let localTeam = [...MOCK_TEAM];

export const teamApi = {
  list: () => {
    if (DEV) return Promise.resolve(localTeam);
    return api.get<TeamMember[]>('/team').then(r => r.data);
  },

  invite: (data: InviteRequest) => {
    if (DEV) {
      const member: TeamMember = {
        id: String(Date.now()),
        email: data.email,
        role: data.role,
        createdAt: new Date().toISOString(),
      };
      localTeam = [...localTeam, member];
      return Promise.resolve(member);
    }
    return api.post<TeamMember>('/team/invite', data).then(r => r.data);
  },

  remove: (userId: string) => {
    if (DEV) {
      localTeam = localTeam.filter(m => m.id !== userId);
      return Promise.resolve();
    }
    return api.delete(`/team/${userId}`).then(() => undefined);
  },
};
