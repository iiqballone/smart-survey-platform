import { create } from 'zustand';
import type { AuthUser } from '@/types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitialising: boolean;
  setUser: (user: AuthUser | null) => void;
  setInitialising: (value: boolean) => void;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialising: true,

  setUser: (user) => set({ user, isAuthenticated: user !== null }),
  setInitialising: (isInitialising) => set({ isInitialising }),

  hasRole: (role) => get().user?.roles.includes(role as AuthUser['roles'][number]) ?? false,
  isAdmin: () => get().user?.roles.includes('PLATFORM_ADMIN') ?? false,
}));
