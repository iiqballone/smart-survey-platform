import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { useAuthStore } from '@/store/authStore';
import type { AuthUser, UserRole } from '@/types';
import '@/styles/index.css';

const DEV_BYPASS = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

async function bootstrap() {
  const setUser = useAuthStore.getState().setUser;
  const setInitialising = useAuthStore.getState().setInitialising;

  if (DEV_BYPASS) {
    // In bypass mode keycloak is never initialised — auth is handled in LoginPage
    setInitialising(false);
  } else {
    const keycloak = (await import('@/lib/keycloak')).default;
    try {
      const authenticated = await keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        pkceMethod: 'S256',
      });

      if (authenticated && keycloak.tokenParsed) {
        const parsed = keycloak.tokenParsed as {
          sub: string;
          email?: string;
          name?: string;
          realm_access?: { roles: string[] };
          client_group_id?: string;
        };
        const user: AuthUser = {
          id: parsed.sub,
          email: parsed.email ?? '',
          name: parsed.name ?? parsed.email ?? '',
          roles: (parsed.realm_access?.roles ?? []).filter((r): r is UserRole =>
            ['CLIENT_ADMIN', 'CLIENT_VIEWER', 'PLATFORM_ADMIN'].includes(r),
          ),
          clientGroupId: parsed.client_group_id,
        };
        setUser(user);
      }
    } catch {
      // Keycloak unavailable — continue unauthenticated
    } finally {
      setInitialising(false);
    }
  }

  const { App } = await import('./app/App');
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap();
