import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import type { AuthUser } from '@/types';

const DEV_BYPASS = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

const DEV_USERS: Array<{ label: string; user: AuthUser }> = [
  {
    label: 'Client Admin',
    user: { id: 'dev-client-admin', email: 'admin@acme.com', name: 'Alice Admin', roles: ['CLIENT_ADMIN'], clientGroupId: 'client-acme' },
  },
  {
    label: 'Client Viewer',
    user: { id: 'dev-client-viewer', email: 'viewer@acme.com', name: 'Bob Viewer', roles: ['CLIENT_VIEWER'], clientGroupId: 'client-acme' },
  },
  {
    label: 'Platform Admin',
    user: { id: 'dev-platform-admin', email: 'admin@surveybridge.io', name: 'Carol Platform', roles: ['PLATFORM_ADMIN'] },
  },
];

export function LoginPage() {
  const { isAuthenticated, isInitialising, login } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  if (isInitialising) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">SurveyBridge</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in to your account</p>
        </div>

        <div className="card-padded space-y-3">
          {DEV_BYPASS ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                Dev mode — select a role to sign in
              </p>
              {DEV_USERS.map(({ label, user }) => (
                <Button
                  key={label}
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => { setUser(user); navigate('/dashboard', { replace: true }); }}
                >
                  <span className="text-gray-400 mr-1">→</span> {label}
                  <span className="ml-auto text-xs text-gray-400">{user.email}</span>
                </Button>
              ))}
            </>
          ) : (
            <>
              <Button className="w-full" size="lg" onClick={login}>
                Sign in with SSO
              </Button>
              <p className="text-center text-xs text-gray-400">
                Secured by Keycloak — your credentials are never stored here.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
