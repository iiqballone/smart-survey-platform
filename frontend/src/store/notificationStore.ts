import { create } from 'zustand';

export type NotifType = 'success' | 'warning' | 'info' | 'error';

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  time: string; // ISO
}

interface NotifState {
  notifications: Notification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: () => number;
}

const SEED: Notification[] = [
  { id: 'n1', type: 'success', title: 'Survey quota reached',      body: 'NPS Benchmark 2025 collected all 600 responses.',                          link: '/surveys/5/reports', read: false, time: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: 'n2', type: 'info',    title: 'Milestone — 50% complete',  body: 'Q2 Brand Perception Study hit 250/500 responses.',                         link: '/surveys/1',         read: false, time: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'n3', type: 'warning', title: 'Quota at 78%',              body: 'You have used 3,900 / 5,000 monthly responses. Upgrade to avoid limits.',   link: '/billing',           read: false, time: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'n4', type: 'warning', title: 'Dynata sync paused',        body: 'Ad Recall Test – Campaign V2 paused by Dynata: low IR detected.',           link: '/surveys/4',         read: true,  time: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: 'n5', type: 'info',    title: 'Team member joined',        body: 'bob@acme.com accepted your invitation as Viewer.',                          link: '/team',              read: true,  time: new Date(Date.now() - 2 * 86400000).toISOString() },
];

export const useNotifStore = create<NotifState>((set, get) => ({
  notifications: SEED,
  markRead: (id) =>
    set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })),
  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
