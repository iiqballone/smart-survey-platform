import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import type { AuthUser } from '@/types';

const DEV_BYPASS = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

const DEV_USERS: Array<{ label: string; sub: string; user: AuthUser }> = [
  {
    label: 'Client Admin',
    sub: 'admin@acme.com',
    user: { id: 'dev-client-admin', email: 'admin@acme.com', name: 'Alice Admin', roles: ['CLIENT_ADMIN'], clientGroupId: 'client-acme' },
  },
  {
    label: 'Client Viewer',
    sub: 'viewer@acme.com',
    user: { id: 'dev-client-viewer', email: 'viewer@acme.com', name: 'Bob Viewer', roles: ['CLIENT_VIEWER'], clientGroupId: 'client-acme' },
  },
  {
    label: 'Platform Admin',
    sub: 'admin@surveybridge.io',
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <span className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">S</div>
          <div className="logo-name">Survey<span>Bridge</span></div>
        </div>
        <p className="login-sub">Survey platform — sign in to continue</p>

        {DEV_BYPASS ? (
          <>
            <div className="dev-banner">DEV MODE — Select a role</div>
            {DEV_USERS.map(({ label, sub, user }) => (
              <button
                key={label}
                className="dev-btn"
                onClick={() => { setUser(user); navigate('/dashboard', { replace: true }); }}
              >
                <span style={{ fontSize: 15 }}>→</span>
                <span>{label}</span>
                <span className="dev-email">{sub}</span>
              </button>
            ))}
          </>
        ) : (
          <>
            <button className="btn btn-p" style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }} onClick={login}>
              Sign in with SSO
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)' }}>
              Secured by Keycloak — your credentials are never stored here.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
