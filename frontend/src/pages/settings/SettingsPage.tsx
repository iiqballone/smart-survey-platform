import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/common/Badge';

type Tab = 'profile' | 'notifications' | 'security';

interface Toggle { id: string; label: string; sub: string; defaultOn: boolean }

const NOTIFICATION_TOGGLES: Toggle[] = [
  { id: 'survey-complete', label: 'Survey completed',    sub: 'When a survey reaches its target responses',   defaultOn: true  },
  { id: 'new-response',    label: 'New response batch',  sub: 'Daily digest of incoming responses',           defaultOn: true  },
  { id: 'quota-warning',   label: 'Quota warning',       sub: 'When you reach 80% of your monthly quota',     defaultOn: true  },
  { id: 'team-invite',     label: 'Team invitations',    sub: 'When someone joins or leaves your workspace',  defaultOn: false },
  { id: 'platform-news',   label: 'Platform updates',    sub: 'Product announcements and release notes',      defaultOn: false },
];

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={on} onChange={onChange} />
      <span className="tslider" />
    </label>
  );
}

export function SettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_TOGGLES.map((t) => [t.id, t.defaultOn]))
  );

  const flip = (id: string) => setToggles((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="settings-wrap">
      <div className="sh"><div className="st">Settings</div></div>

      <div className="tabs">
        {(['profile', 'notifications', 'security'] as Tab[]).map((t) => (
          <button key={t} className={`tab${tab === t ? ' on' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="fsec">
          <div className="fst"><span className="fsi">👤</span> Account details</div>
          <div className="frow">
            <div className="fg">
              <span className="fl">Full name</span>
              <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{user?.name ?? '—'}</span>
            </div>
            <div className="fg">
              <span className="fl">Email</span>
              <span style={{ fontSize: 14, color: 'var(--text)' }}>{user?.email ?? '—'}</span>
            </div>
          </div>
          <div className="fg" style={{ marginTop: 8 }}>
            <span className="fl">Roles</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {user?.roles.map((r) => <Badge key={r} label={r.replace('_', ' ')} color="blue" />) ?? '—'}
            </div>
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 14, lineHeight: 1.5 }}>
            Profile details are managed in your identity provider. Contact your admin to make changes.
          </p>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="fsec">
          <div className="fst"><span className="fsi">🔔</span> Email notifications</div>
          {NOTIFICATION_TOGGLES.map((t) => (
            <div key={t.id} className="toggle-wrap">
              <div className="toggle-info">
                <div className="tl">{t.label}</div>
                <div className="ts">{t.sub}</div>
              </div>
              <Toggle on={toggles[t.id]} onChange={() => flip(t.id)} />
            </div>
          ))}
        </div>
      )}

      {tab === 'security' && (
        <div className="fsec">
          <div className="fst"><span className="fsi">🔒</span> Security</div>
          <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>Password</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
              Managed via Keycloak SSO. Use your identity provider to change your password.
            </div>
            <button className="btn btn-s btn-sm">Change password →</button>
          </div>
          <div style={{ padding: '14px 0' }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>Two-factor authentication</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
              Add an extra layer of security to your account.
            </div>
            <button className="btn btn-s btn-sm">Set up 2FA →</button>
          </div>
        </div>
      )}
    </div>
  );
}
