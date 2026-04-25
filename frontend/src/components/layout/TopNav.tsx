import { useAuth } from '@/hooks/useAuth';
import { useUiStore } from '@/store/uiStore';
import { Button } from '@/components/common/Button';

export function TopNav() {
  const { user, logout } = useAuth();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <button
        onClick={toggleSidebar}
        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
        aria-label="Toggle sidebar"
      >
        ☰
      </button>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{user?.email}</span>
        <Button variant="secondary" size="sm" onClick={logout}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
