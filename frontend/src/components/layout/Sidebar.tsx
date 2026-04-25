import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUiStore } from '@/store/uiStore';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/surveys', label: 'Surveys', icon: '◧' },
  { to: '/settings/profile', label: 'Settings', icon: '⚙' },
  { to: '/admin/clients', label: 'Clients', icon: '👥', adminOnly: true },
  { to: '/admin/dynata', label: 'Dynata Monitor', icon: '🔌', adminOnly: true },
  { to: '/admin/system', label: 'System Health', icon: '❤', adminOnly: true },
];

export function Sidebar() {
  const { isAdmin } = useAuth();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-gray-900 text-white transition-all duration-200
        ${sidebarOpen ? 'w-56' : 'w-16'}`}
    >
      <div className="flex h-16 items-center px-4 border-b border-gray-700">
        {sidebarOpen ? (
          <span className="text-lg font-bold text-white">SurveyBridge</span>
        ) : (
          <span className="text-lg font-bold text-white">SB</span>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin())
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`
              }
            >
              <span className="text-base leading-none">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
