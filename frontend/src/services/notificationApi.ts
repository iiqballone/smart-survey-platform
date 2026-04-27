import api from './api';
import type { NotificationDto } from '@/types';
import { MOCK_NOTIFICATIONS } from '@/mocks/data';

const DEV = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

let localNotifs = [...MOCK_NOTIFICATIONS];

export const notificationApi = {
  list: () => {
    if (DEV) return Promise.resolve(localNotifs);
    return api.get<NotificationDto[]>('/notifications').then(r => r.data);
  },

  markRead: (id: string) => {
    if (DEV) {
      localNotifs = localNotifs.map(n => n.id === id ? { ...n, read: true } : n);
      return Promise.resolve();
    }
    return api.put(`/notifications/${id}/read`).then(() => undefined);
  },

  markAllRead: () => {
    if (DEV) {
      localNotifs = localNotifs.map(n => ({ ...n, read: true }));
      return Promise.resolve();
    }
    return api.put('/notifications/read-all').then(() => undefined);
  },
};
