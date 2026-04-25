import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Modal } from '@/components/common/Modal';
import { Spinner } from '@/components/common/Spinner';
import { useResponses } from '@/hooks/useResponses';
import { useSurvey } from '@/hooks/useSurveys';
import { responseApi } from '@/services/responseApi';
import type { SurveyResponse } from '@/types';

const PAGE_SIZE = 20;

export function ResponseViewer() {
  const { id: surveyId = '' } = useParams();
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<SurveyResponse | null>(null);

  const { data: survey } = useSurvey(surveyId);
  const { data, isPending } = useResponses(surveyId, { page, size: PAGE_SIZE });

  const totalPages = data ? Math.ceil(data.totalElements / PAGE_SIZE) : 0;

  return (
    <div>
      <div className="sh">
        <div>
          <div className="st">{survey ? `Responses — ${survey.title}` : 'Responses'}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{data?.totalElements ?? 0} total</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-s btn-sm"
            onClick={() => window.open(responseApi.exportUrl(surveyId, 'csv'), '_blank')}
          >
            Export CSV
          </button>
          <button
            className="btn btn-s btn-sm"
            onClick={() => window.open(responseApi.exportUrl(surveyId, 'excel'), '_blank')}
          >
            Export Excel
          </button>
        </div>
      </div>

      {isPending ? (
        <div className="center-spinner"><Spinner size="lg" /></div>
      ) : (
        <div className="tw">
          <div className="tscroll">
            <table>
              <thead>
                <tr>
                  <th>Completed</th>
                  <th>Country</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>Duration</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(data?.content ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
                      No responses yet.
                    </td>
                  </tr>
                ) : (
                  (data?.content ?? []).map((r) => (
                    <tr key={r.id}>
                      <td style={{ color: 'var(--muted)' }}>{new Date(r.completedAt).toLocaleString()}</td>
                      <td>{r.country}</td>
                      <td>{r.gender}</td>
                      <td>{r.ageGroup}</td>
                      <td style={{ color: 'var(--muted)' }}>{Math.round(r.durationSeconds / 60)}m {r.durationSeconds % 60}s</td>
                      <td>
                        <button className="btn btn-g btn-xs" onClick={() => setSelected(r)}>View</button>
                      </td>
                    </tr>
                  ))
                )}
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

      <Modal
        open={!!selected}
        title="Response Detail"
        subtitle={selected ? `Completed ${new Date(selected.completedAt).toLocaleString()}` : ''}
        onClose={() => setSelected(null)}
        footer={<button className="btn btn-s btn-sm" onClick={() => setSelected(null)}>Close</button>}
      >
        {selected && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 16, fontSize: 13, color: 'var(--muted)' }}>
              <span><strong style={{ color: 'var(--text)' }}>Country:</strong> {selected.country}</span>
              <span><strong style={{ color: 'var(--text)' }}>Gender:</strong> {selected.gender}</span>
              <span><strong style={{ color: 'var(--text)' }}>Age:</strong> {selected.ageGroup}</span>
              <span><strong style={{ color: 'var(--text)' }}>Duration:</strong> {Math.round(selected.durationSeconds / 60)}m {selected.durationSeconds % 60}s</span>
            </div>
            {selected.answers.map((a) => (
              <div key={a.questionId} className="ans-block">
                <div className="ans-q">{a.questionText}</div>
                <div className="ans-v">{a.value}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
