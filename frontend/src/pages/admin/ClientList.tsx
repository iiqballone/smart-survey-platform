import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Table } from '@/components/common/Table';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { adminApi } from '@/services/adminApi';
import type { Client } from '@/types';
import type { Column } from '@/components/common/Table';

export function ClientList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const { data, isPending } = useQuery({
    queryKey: ['admin', 'clients', page],
    queryFn: () => adminApi.listClients({ page, size: 20 }),
  });

  const columns: Column<Client>[] = [
    {
      key: 'name',
      header: 'Client',
      render: (c) => (
        <button
          className="font-medium text-primary-600 hover:underline"
          onClick={() => navigate(`/admin/clients/${c.id}`)}
        >
          {c.name}
        </button>
      ),
    },
    { key: 'email',  header: 'Email',  render: (c) => c.contactEmail },
    { key: 'plan',   header: 'Plan',   render: (c) => <Badge label={c.plan} color="blue" /> },
    {
      key: 'quota',
      header: 'Usage',
      render: (c) => (
        <span>
          {c.usedResponseCount.toLocaleString()}
          <span className="text-gray-400"> / {c.monthlyResponseQuota.toLocaleString()}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => <Badge label={c.active ? 'Active' : 'Inactive'} color={c.active ? 'green' : 'gray'} />,
    },
  ];

  const totalPages = data ? Math.ceil(data.totalElements / 20) : 0;

  return (
    <div>
      <PageHeader title="Clients" subtitle="All client accounts" />
      <Table
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(c) => c.id}
        loading={isPending}
        emptyMessage="No clients found."
      />
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Previous</Button>
          <span>Page {page + 1} of {totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next →</Button>
        </div>
      )}
    </div>
  );
}
