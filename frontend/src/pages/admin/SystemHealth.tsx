import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/common/Spinner';
import { adminApi } from '@/services/adminApi';

interface HealthComponent { status: 'UP' | 'DOWN' | 'UNKNOWN' }
interface HealthData { status: 'UP' | 'DOWN' | 'DEGRADED'; components: Record<string, HealthComponent> }

const statusColor = (s: string): 'green' | 'red' | 'yellow' =>
  s === 'UP' ? 'green' : s === 'DOWN' ? 'red' : 'yellow';

export function SystemHealth() {
  const { data, isPending, refetch } = useQuery<HealthData>({
    queryKey: ['admin', 'health'],
    queryFn: adminApi.health,
    refetchInterval: 60_000,
  });

  return (
    <div>
      <div className="sh">
        <div className="st">System Health</div>
        <button className="btn btn-s btn-sm" onClick={() => void refetch()}>↻ Refresh</button>
      </div>

      {isPending ? (
        <div className="center-spinner"><Spinner size="lg" /></div>
      ) : !data ? (
        <div className="fsec" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--danger)' }}>
          Unable to fetch health data.
        </div>
      ) : (
        <div>
          <div className="ccard" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="ctitle">Overall</div>
              <div className="csub">Platform status</div>
            </div>
            <Badge label={data.status} color={statusColor(data.status)} />
          </div>
          {Object.entries(data.components ?? {}).map(([name, comp]) => (
            <div key={name} className="ccard" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="ctitle" style={{ textTransform: 'capitalize' }}>{name}</div>
              <Badge label={comp.status} color={statusColor(comp.status)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
