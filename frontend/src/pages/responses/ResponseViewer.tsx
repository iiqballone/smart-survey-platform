import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/common/Button';
import { Table } from '@/components/common/Table';
import { Modal } from '@/components/common/Modal';
import { useResponses } from '@/hooks/useResponses';
import { useSurvey } from '@/hooks/useSurveys';
import { responseApi } from '@/services/responseApi';
import type { SurveyResponse } from '@/types';
import type { Column } from '@/components/common/Table';

const PAGE_SIZE = 20;

export function ResponseViewer() {
  const { id: surveyId = '' } = useParams();
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<SurveyResponse | null>(null);

  const { data: survey } = useSurvey(surveyId);
  const { data, isPending } = useResponses(surveyId, { page, size: PAGE_SIZE });

  const columns: Column<SurveyResponse>[] = [
    {
      key: 'completedAt',
      header: 'Completed',
      render: (r) => new Date(r.completedAt).toLocaleString(),
    },
    {
      key: 'country',
      header: 'Country',
      render: (r) => r.country,
    },
    {
      key: 'gender',
      header: 'Gender',
      render: (r) => r.gender,
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (r) => `${Math.round(r.durationSeconds / 60)}m ${r.durationSeconds % 60}s`,
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <Button size="sm" variant="ghost" onClick={() => setSelected(r)}>View</Button>
      ),
    },
  ];

  const totalPages = data ? Math.ceil(data.totalElements / PAGE_SIZE) : 0;

  return (
    <div>
      <PageHeader
        title={survey ? `Responses — ${survey.title}` : 'Responses'}
        subtitle={`${data?.totalElements ?? 0} total responses`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(responseApi.exportUrl(surveyId, 'csv'), '_blank')}
            >
              Export CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(responseApi.exportUrl(surveyId, 'excel'), '_blank')}
            >
              Export Excel
            </Button>
          </div>
        }
      />

      <Table
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(r) => r.id}
        loading={isPending}
        emptyMessage="No responses yet."
      />

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            ← Previous
          </Button>
          <span>Page {page + 1} of {totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Next →
          </Button>
        </div>
      )}

      {selected && (
        <Modal
          open
          title="Response Detail"
          onClose={() => setSelected(null)}
          size="lg"
          footer={<Button variant="secondary" onClick={() => setSelected(null)}>Close</Button>}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
              <span><strong>Completed:</strong> {new Date(selected.completedAt).toLocaleString()}</span>
              <span><strong>Country:</strong> {selected.country}</span>
              <span><strong>Gender:</strong> {selected.gender}</span>
              <span><strong>Duration:</strong> {Math.round(selected.durationSeconds / 60)}m {selected.durationSeconds % 60}s</span>
            </div>
            {selected.answers.map((a) => (
              <div key={a.questionId} className="rounded-md bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-500 mb-1">{a.questionText}</p>
                <p className="text-sm text-gray-900">{a.value}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
