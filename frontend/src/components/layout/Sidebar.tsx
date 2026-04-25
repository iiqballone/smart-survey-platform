import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUiStore } from '@/store/uiStore';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  badge?: string;
  adminOnly?: boolean;
}

const mainNav: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/surveys',   label: 'Surveys',   icon: '◧', badge: '2' },
  { to: '/surveys/responses', label: 'Responses', icon: '✉' },
  { to: '/reports',   label: 'Reports',   icon: '📊' },
];

const bottomNav: NavItem[] = [
  { to: '/team',     label: 'Team',     icon: '👥' },
  { to: '/billing',  label: 'Billing',  icon: '💳' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

const adminNav: NavItem[] = [
  { to: '/admin/clients', label: 'Clients',       icon: '🏢', adminOnly: true },
  { to: '/admin/dynata',  label: 'Dynata Monitor', icon: '🔌', adminOnly: true },
  { to: '/admin/system',  label: 'System Health',  icon: '❤',  adminOnly: true },
];

export function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const navigate = useNavigate();

  const close = () => setSidebarOpen(false);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
      <div className="sb-logo">
        <div className="logo-wrap">
          <div className="logo-icon">S</div>
          <div className="logo-name">Survey<span>Bridge</span></div>
        </div>
        <button className="sb-x" onClick={close} aria-label="Close sidebar">✕</button>
      </div>

      <nav className="sb-nav">
        <div className="nav-lbl">Main</div>
        {mainNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `ni${isActive ? ' on' : ''}`}
            onClick={close}
          >
            <span className="ni-icon">{item.icon}</span>
            {item.label}
            {item.badge && <span className="ni-badge">{item.badge}</span>}
          </NavLink>
        ))}

        <div className="nav-lbl" style={{ marginTop: 8 }}>Account</div>
        {bottomNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `ni${isActive ? ' on' : ''}`}
            onClick={close}
          >
            <span className="ni-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {isAdmin() && (
          <>
            <div className="nav-lbl" style={{ marginTop: 8 }}>Admin</div>
            {adminNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `ni${isActive ? ' on' : ''}`}
                onClick={close}
              >
                <span className="ni-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="sb-foot">
        <div className="ucard" onClick={() => { navigate('/settings'); close(); }}>
          <div className="avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="uname">{user?.name ?? 'User'}</div>
            <div className="urole">{user?.roles[0]?.replace('_', ' ') ?? ''}</div>
          </div>
          <button
            className="btn btn-g btn-xs"
            onClick={(e) => { e.stopPropagation(); logout(); }}
          >
            Out
          </button>
        </div>
      </div>
    </aside>
  );
}
