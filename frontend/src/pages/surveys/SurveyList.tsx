import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/common/Button';
import { Table } from '@/components/common/Table';
import { SurveyStatusBadge } from '@/components/survey/SurveyStatusBadge';
import { useSurveys, useDeleteSurvey } from '@/hooks/useSurveys';
import { useAuth } from '@/hooks/useAuth';
import type { Survey, SurveyStatus } from '@/types';
import type { Column } from '@/components/common/Table';

const STATUS_FILTERS: Array<{ label: string; value: SurveyStatus | 'ALL' }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Live', value: 'LIVE' },
  { label: 'Paused', value: 'PAUSED' },
  { label: 'Completed', value: 'COMPLETED' },
];

export function SurveyList() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<SurveyStatus | 'ALL'>('ALL');
  const { hasRole } = useAuth();
  const canEdit = hasRole('CLIENT_ADMIN') || hasRole('PLATFORM_ADMIN');

  const { data, isPending } = useSurveys(statusFilter !== 'ALL' ? { status: statusFilter } : undefined);
  const deleteMutation = useDeleteSurvey();

  const columns: Column<Survey>[] = [
    {
      key: 'title',
      header: 'Survey',
      render: (s) => (
        <Link to={`/surveys/${s.id}`} className="font-medium text-primary-600 hover:underline">
          {s.title}
        </Link>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => <SurveyStatusBadge status={s.status} />,
    },
    {
      key: 'responses',
      header: 'Responses',
      render: (s) => (
        <span>
          {s.receivedResponseCount.toLocaleString()}
          <span className="text-gray-400"> / {s.targetResponseCount.toLocaleString()}</span>
        </span>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      render: (s) => new Date(s.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: '',
      render: (s) => (
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="secondary" onClick={() => navigate(`/surveys/${s.id}/responses`)}>
            Responses
          </Button>
          {canEdit && s.status === 'DRAFT' && (
            <Button size="sm" variant="secondary" onClick={() => navigate(`/surveys/${s.id}/edit`)}>
              Edit
            </Button>
          )}
          {canEdit && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                if (confirm('Delete this survey?')) deleteMutation.mutate(s.id);
              }}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Surveys"
        subtitle="All your surveys"
        actions={canEdit ? <Button onClick={() => navigate('/surveys/new')}>+ New Survey</Button> : undefined}
      />

      <div className="mb-4 flex gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors
              ${statusFilter === f.value ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Table
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(s) => s.id}
        loading={isPending}
        emptyMessage="No surveys found."
      />
    </div>
  );
}
