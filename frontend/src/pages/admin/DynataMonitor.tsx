import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/common/Spinner';
import { adminApi } from '@/services/adminApi';

interface DynataJob {
  dynataProjectId: string;
  title: string;
  syncStatus: string;
  receivedResponseCount: number;
  targetResponseCount: number;
}

export function DynataMonitor() {
  const { data: jobs, isPending } = useQuery<DynataJob[]>({
    queryKey: ['admin', 'dynata', 'jobs'],
    queryFn: adminApi.dynataJobs,
    refetchInterval: 30_000,
  });

  const syncColor = (s: string): 'green' | 'red' | 'yellow' =>
    s === 'SYNCED' ? 'green' : s === 'SYNC_FAILED' ? 'red' : 'yellow';

  return (
    <div>
      <div className="sh">
        <div className="st">Dynata Monitor</div>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Auto-refresh every 30s</span>
      </div>

      {isPending ? (
        <div className="center-spinner"><Spinner size="lg" /></div>
      ) : !jobs || jobs.length === 0 ? (
        <div className="empty">
          <div className="ei">🔌</div>
          <div className="et">No active Dynata jobs</div>
        </div>
      ) : (
        <div className="tw">
          <div className="tscroll">
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Dynata ID</th>
                  <th>Progress</th>
                  <th>Responses</th>
                  <th>Sync status</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const pct = job.targetResponseCount > 0
                    ? Math.min(100, (job.receivedResponseCount / job.targetResponseCount) * 100)
                    : 0;
                  return (
                    <tr key={job.dynataProjectId}>
                      <td><div className="sn">{job.title}</div></td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--muted)' }}>{job.dynataProjectId}</span></td>
                      <td>
                        <div className="pbar"><div className="pfill" style={{ width: `${pct}%` }} /></div>
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>{pct.toFixed(0)}%</div>
                      </td>
                      <td style={{ color: 'var(--muted)' }}>
                        {job.receivedResponseCount} / {job.targetResponseCount}
                      </td>
                      <td><Badge label={job.syncStatus.replace('_', ' ')} color={syncColor(job.syncStatus)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
