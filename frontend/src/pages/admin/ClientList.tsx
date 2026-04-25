import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/common/Spinner';
import { adminApi } from '@/services/adminApi';
import type { Client } from '@/types';

export function ClientList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const { data, isPending } = useQuery({
    queryKey: ['admin', 'clients', page],
    queryFn: () => adminApi.listClients({ page, size: 20 }),
  });

  const totalPages = data ? Math.ceil(data.totalElements / 20) : 0;

  return (
    <div>
      <div className="sh">
        <div className="st">Clients</div>
      </div>

      {isPending ? (
        <div className="center-spinner"><Spinner size="lg" /></div>
      ) : (
        <div className="tw">
          <div className="tscroll">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Usage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.content ?? []).map((c: Client) => {
                  const pct = c.monthlyResponseQuota > 0
                    ? Math.min(100, (c.usedResponseCount / c.monthlyResponseQuota) * 100)
                    : 0;
                  return (
                    <tr key={c.id}>
                      <td>
                        <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 13, fontWeight: 500, padding: 0 }}
                          onClick={() => navigate(`/admin/clients/${c.id}`)}
                        >
                          {c.name}
                        </button>
                      </td>
                      <td style={{ color: 'var(--muted)' }}>{c.contactEmail}</td>
                      <td><Badge label={c.plan} color="blue" /></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="pbar" style={{ width: 60 }}>
                            <div className="pfill" style={{ width: `${pct}%` }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                            {c.usedResponseCount.toLocaleString()} / {c.monthlyResponseQuota.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td>
                        <Badge label={c.active ? 'Active' : 'Inactive'} color={c.active ? 'green' : 'gray'} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>
          <button className="btn btn-s btn-sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Previous</button>
          <span>Page {page + 1} of {totalPages}</span>
          <button className="btn btn-s btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
