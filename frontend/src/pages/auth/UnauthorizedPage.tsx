import { Link } from 'react-router-dom';

export function UnauthorizedPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: 12, textAlign: 'center', padding: 20 }}>
      <div style={{ fontSize: 48 }}>🔒</div>
      <div style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Access Denied</div>
      <div style={{ fontSize: 13, color: 'var(--muted)' }}>You don't have permission to view this page.</div>
      <Link to="/dashboard" className="btn btn-s" style={{ marginTop: 8 }}>Go to Dashboard</Link>
    </div>
  );
}
