import { useLocation } from 'react-router-dom';
import { useUiStore } from '@/store/uiStore';
import { NotificationBell } from './NotificationBell';

const titleMap: Record<string, string> = {
  '/dashboard':          'Dashboard',
  '/surveys':            'Surveys',
  '/surveys/templates':  'Templates',
  '/reports':            'Analytics',
  '/team':               'Team',
  '/billing':            'Billing',
  '/settings':           'Settings',
  '/admin/clients':      'Clients',
  '/admin/dynata':       'Dynata Monitor',
  '/admin/system':       'System Health',
};

function pageTitle(pathname: string): string {
  if (titleMap[pathname]) return titleMap[pathname];
  if (pathname.startsWith('/surveys/') && pathname.endsWith('/responses')) return 'Responses';
  if (pathname.startsWith('/surveys/') && pathname.endsWith('/reports'))   return 'Survey Report';
  if (pathname.startsWith('/surveys/new'))  return 'New Survey';
  if (pathname.startsWith('/surveys/'))     return 'Survey Detail';
  if (pathname.startsWith('/admin/clients/')) return 'Client Detail';
  return 'SurveyBridge';
}

export function TopNav() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const { pathname } = useLocation();

  return (
    <div className="topbar">
      <button className="hbg" onClick={toggleSidebar} aria-label="Open sidebar">☰</button>
      <div className="ptitle">{pageTitle(pathname)}</div>
      <div className="tbar-acts">
        <NotificationBell />
      </div>
    </div>
  );
}
