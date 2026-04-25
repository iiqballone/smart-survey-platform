import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/common/Badge';
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
    mutationFn: (q: number) => adminApi.updateQuota(id, q).then(() => {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'clients', id] });
      setEditingQuota(false);
    },
  });

  if (isPending) return <div className="center-spinner"><Spinner size="lg" /></div>;
  if (!client)   return <p style={{ color: 'var(--muted)' }}>Client not found.</p>;

  const usagePct = client.monthlyResponseQuota > 0
    ? Math.min(100, (client.usedResponseCount / client.monthlyResponseQuota) * 100)
    : 0;

  return (
    <div className="fw">
      <div className="sh">
        <div>
          <div className="st">{client.name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{client.contactEmail}</div>
        </div>
        <Badge label={client.active ? 'Active' : 'Inactive'} color={client.active ? 'green' : 'gray'} />
      </div>

      <div className="fsec">
        <div className="fst"><span className="fsi">🏢</span> Account details</div>
        <div className="frow">
          <div className="fg">
            <span className="fl">Plan</span>
            <div style={{ marginTop: 4 }}><Badge label={client.plan} color="blue" /></div>
          </div>
          <div className="fg">
            <span className="fl">Member since</span>
            <span style={{ fontSize: 13, color: 'var(--text)' }}>{new Date(client.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="fsec">
        <div className="fst"><span className="fsi">📊</span> Monthly quota</div>

        <div className="usage-row">
          <div className="usage-lbl">Responses used</div>
          <div className="usage-bar">
            <div
              className="usage-fill"
              style={{
                width: `${usagePct}%`,
                background: usagePct >= 90 ? 'var(--danger)' : 'linear-gradient(90deg,var(--accent),var(--accent2))',
              }}
            />
          </div>
          <div className="usage-val">{client.usedResponseCount.toLocaleString()} / {client.monthlyResponseQuota.toLocaleString()}</div>
        </div>

        <div style={{ marginTop: 14 }}>
          {!editingQuota ? (
            <button
              className="btn btn-s btn-sm"
              onClick={() => { setEditingQuota(true); setQuota(String(client.monthlyResponseQuota)); }}
            >
              Edit quota
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="number"
                className="fi"
                style={{ width: 120 }}
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
              />
              <button
                className="btn btn-p btn-sm"
                disabled={updateQuota.isPending}
                onClick={() => updateQuota.mutate(Number(quota))}
              >
                {updateQuota.isPending && <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />}
                Save
              </button>
              <button className="btn btn-s btn-sm" onClick={() => setEditingQuota(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
