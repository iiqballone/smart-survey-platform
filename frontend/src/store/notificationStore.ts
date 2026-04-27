import { create } from 'zustand';
import type { NotifLevel } from '@/types';

export interface Notification {
  id: string;
  type: NotifLevel;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  time: string;
}

interface NotifState {
  notifications: Notification[];
  setNotifications: (items: Notification[]) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: () => number;
}

export const useNotifStore = create<NotifState>((set, get) => ({
  notifications: [],
  setNotifications: (items) => set({ notifications: items }),
  markRead: (id) =>
    set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })),
  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
