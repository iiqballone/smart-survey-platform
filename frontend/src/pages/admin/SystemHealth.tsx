import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/common/Spinner';
import { adminApi } from '@/services/adminApi';

interface HealthComponent {
  status: 'UP' | 'DOWN' | 'UNKNOWN';
  details?: Record<string, unknown>;
}

interface HealthData {
  status: 'UP' | 'DOWN';
  components: Record<string, HealthComponent>;
}

export function SystemHealth() {
  const { data, isPending, refetch } = useQuery<HealthData>({
    queryKey: ['admin', 'health'],
    queryFn: adminApi.health,
    refetchInterval: 60_000,
  });

  const statusColor = (s: string) =>
    s === 'UP' ? 'green' : s === 'DOWN' ? 'red' : 'yellow';

  return (
    <div>
      <PageHeader
        title="System Health"
        subtitle="Live platform component status"
        actions={
          <button
            onClick={() => void refetch()}
            className="text-sm text-primary-600 hover:underline"
          >
            Refresh
          </button>
        }
      />
      {isPending ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : !data ? (
        <div className="card-padded text-sm text-red-500 py-16 text-center">
          Unable to fetch health data from backend.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="card p-4 flex items-center justify-between">
            <span className="font-semibold text-gray-900">Overall</span>
            <Badge label={data.status} color={statusColor(data.status) as 'green' | 'red' | 'yellow'} />
          </div>
          {Object.entries(data.components ?? {}).map(([name, comp]) => (
            <div key={name} className="card p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 capitalize">{name}</span>
              <Badge label={comp.status} color={statusColor(comp.status) as 'green' | 'red' | 'yellow'} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
