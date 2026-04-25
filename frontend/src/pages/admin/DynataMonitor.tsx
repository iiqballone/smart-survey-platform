import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/common/Spinner';
import { adminApi } from '@/services/adminApi';

export function DynataMonitor() {
  const { data: jobs, isPending } = useQuery({
    queryKey: ['admin', 'dynata', 'jobs'],
    queryFn: adminApi.dynataJobs,
    refetchInterval: 30_000,
  });

  return (
    <div>
      <PageHeader title="Dynata Monitor" subtitle="Active Dynata survey jobs and sync status" />
      {isPending ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : !jobs || jobs.length === 0 ? (
        <div className="card-padded text-center text-sm text-gray-400 py-16">
          No active Dynata jobs.
        </div>
      ) : (
        <div className="space-y-2">
          {(jobs as Array<{ dynataProjectId: string; title: string; syncStatus: string; receivedResponseCount: number; targetResponseCount: number }>).map((job) => (
            <div key={job.dynataProjectId} className="card p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{job.title}</p>
                <p className="text-xs text-gray-500 font-mono">{job.dynataProjectId}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{job.receivedResponseCount} / {job.targetResponseCount}</span>
                <Badge
                  label={job.syncStatus}
                  color={job.syncStatus === 'SYNCED' ? 'green' : job.syncStatus === 'SYNC_FAILED' ? 'red' : 'yellow'}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
