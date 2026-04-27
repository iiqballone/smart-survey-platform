import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/common/Spinner';
import { adminApi } from '@/services/adminApi';
import type { FusionJob } from '@/types';

export function DynataMonitor() {
  const { data: jobs, isPending } = useQuery<FusionJob[]>({
    queryKey: ['admin', 'fusion', 'jobs'],
    queryFn: adminApi.fusionJobs,
    refetchInterval: 30_000,
  });

  const stateColor = (s: string): 'green' | 'yellow' =>
    s === 'LIVE' ? 'green' : 'yellow';

  return (
    <div>
      <div className="sh">
        <div className="st">Fusion Monitor</div>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Auto-refresh every 30s</span>
      </div>

      {isPending ? (
        <div className="center-spinner"><Spinner size="lg" /></div>
      ) : !jobs || jobs.length === 0 ? (
        <div className="empty">
          <div className="ei">🔌</div>
          <div className="et">No active Fusion jobs</div>
        </div>
      ) : (
        <div className="tw">
          <div className="tscroll">
            <table>
              <thead>
                <tr>
                  <th>Survey</th>
                  <th>Fusion ID</th>
                  <th>Progress</th>
                  <th>Completes</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const pct = job.completesRequired > 0
                    ? Math.min(100, (job.completedCount / job.completesRequired) * 100)
                    : 0;
                  return (
                    <tr key={job.fusionSurveyId}>
                      <td><div className="sn">{job.surveyTitle}</div></td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--muted)' }}>{job.fusionSurveyId}</span></td>
                      <td>
                        <div className="pbar"><div className="pfill" style={{ width: `${pct}%` }} /></div>
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>{pct.toFixed(0)}%</div>
                      </td>
                      <td style={{ color: 'var(--muted)' }}>
                        {job.completedCount.toLocaleString()} / {job.completesRequired.toLocaleString()}
                      </td>
                      <td><Badge label={job.state} color={stateColor(job.state)} /></td>
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
