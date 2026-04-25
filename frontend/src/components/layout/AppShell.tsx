import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useUiStore } from '@/store/uiStore';

export function AppShell() {
  const { sidebarOpen, setSidebarOpen } = useUiStore();

  return (
    <div className="app">
      <div className={`backdrop${sidebarOpen ? ' on' : ''}`} onClick={() => setSidebarOpen(false)} />
      <Sidebar />
      <div className="main">
        <TopNav />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
