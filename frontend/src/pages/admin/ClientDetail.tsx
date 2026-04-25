import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { adminApi } from '@/services/adminApi';

export function ClientDetail() {
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const [editingQuota, setEditingQuota] = useState(false);
  const [quota, setQuota] = useState('');

  const { data: client, isPending } = useQuery({
    queryKey: ['admin', 'clients', id],
    queryFn: () => adminApi.getClient(id),
  });

  const updateQuota = useMutation({
    mutationFn: (q: number) => adminApi.updateQuota(id, q),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'clients', id] });
      setEditingQuota(false);
    },
  });

  if (isPending) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!client) return <p className="text-gray-500">Client not found.</p>;

  const usagePct = client.monthlyResponseQuota > 0
    ? Math.min(100, (client.usedResponseCount / client.monthlyResponseQuota) * 100)
    : 0;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={client.name}
        subtitle={client.contactEmail}
        actions={<Badge label={client.active ? 'Active' : 'Inactive'} color={client.active ? 'green' : 'gray'} />}
      />

      <div className="card-padded space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-500">Plan</p><Badge label={client.plan} color="blue" /></div>
          <div>
            <p className="text-gray-500">Member since</p>
            <p className="font-medium">{new Date(client.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-500">Monthly quota usage</p>
            {!editingQuota ? (
              <Button size="sm" variant="ghost" onClick={() => { setEditingQuota(true); setQuota(String(client.monthlyResponseQuota)); }}>
                Edit quota
              </Button>
            ) : (
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  className="w-28"
                  value={quota}
                  onChange={(e) => setQuota(e.target.value)}
                />
                <Button size="sm" loading={updateQuota.isPending} onClick={() => updateQuota.mutate(Number(quota))}>Save</Button>
                <Button size="sm" variant="secondary" onClick={() => setEditingQuota(false)}>Cancel</Button>
              </div>
            )}
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className={`h-2 rounded-full transition-all ${usagePct >= 90 ? 'bg-red-500' : 'bg-primary-600'}`}
              style={{ width: `${usagePct}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {client.usedResponseCount.toLocaleString()} / {client.monthlyResponseQuota.toLocaleString()} responses used
          </p>
        </div>
      </div>
    </div>
  );
}
