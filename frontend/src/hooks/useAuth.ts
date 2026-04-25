import { useAuthStore } from '@/store/authStore';
import keycloak from '@/lib/keycloak';

export function useAuth() {
  const { user, isAuthenticated, isInitialising, hasRole, isAdmin } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isInitialising,
    hasRole,
    isAdmin,
    login: () => keycloak.login(),
    logout: () => keycloak.logout({ redirectUri: window.location.origin }),
  };
}
