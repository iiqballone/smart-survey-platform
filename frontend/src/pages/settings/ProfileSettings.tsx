import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/common/Badge';

export function ProfileSettings() {
  const { user } = useAuth();

  return (
    <div className="settings-wrap">
      <div className="sh">
        <div className="st">Profile</div>
      </div>

      <div className="fsec">
        <div className="fst"><span className="fsi">👤</span> Account details</div>
        <div className="frow">
          <div className="fg">
            <span className="fl">Name</span>
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
    </div>
  );
}
