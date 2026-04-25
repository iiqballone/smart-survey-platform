import { Link } from 'react-router-dom';

export function UnauthorizedPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
      <p className="text-5xl">🔒</p>
      <h1 className="text-2xl font-semibold text-gray-900">Access Denied</h1>
      <p className="text-sm text-gray-500">You don't have permission to view this page.</p>
      <Link to="/dashboard" className="btn-md btn-secondary">
        Go to Dashboard
      </Link>
    </div>
  );
}
