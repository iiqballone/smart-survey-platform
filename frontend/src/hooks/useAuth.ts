import { useAuthStore } from '@/store/authStore';

const DEV_BYPASS = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

export function useAuth() {
  const { user, isAuthenticated, isInitialising, hasRole, isAdmin, setUser } = useAuthStore();

  const login = async () => {
    const keycloak = (await import('@/lib/keycloak')).default;
    keycloak.login();
  };

  const logout = async () => {
    if (DEV_BYPASS) {
      setUser(null);
      window.location.href = '/login';
      return;
    }
    const keycloak = (await import('@/lib/keycloak')).default;
    keycloak.logout({ redirectUri: window.location.origin + '/login' });
  };

  return { user, isAuthenticated, isInitialising, hasRole, isAdmin, login, logout };
}
