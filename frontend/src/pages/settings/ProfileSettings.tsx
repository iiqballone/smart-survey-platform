import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/common/Badge';

export function ProfileSettings() {
  const { user } = useAuth();

  return (
    <div className="max-w-xl">
      <PageHeader title="Profile" subtitle="Your account details" />
      <div className="card-padded space-y-4">
        <div>
          <p className="text-xs text-gray-500">Name</p>
          <p className="mt-0.5 font-medium text-gray-900">{user?.name ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Email</p>
          <p className="mt-0.5 font-medium text-gray-900">{user?.email ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Roles</p>
          <div className="flex gap-2 flex-wrap">
            {user?.roles.map((r) => <Badge key={r} label={r} color="blue" />) ?? '—'}
          </div>
        </div>
        <p className="text-xs text-gray-400">
          Profile details are managed in your identity provider (Keycloak). Contact your admin to make changes.
        </p>
      </div>
    </div>
  );
}
