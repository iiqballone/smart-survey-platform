import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner } from '@/components/common/Spinner';
import { useResponses } from '@/hooks/useResponses';
import { useSurvey } from '@/hooks/useSurveys';
import { responseApi } from '@/services/responseApi';
import type { SurveyResponse } from '@/types';

const PAGE_SIZE = 20;

const EVENT_COLOR: Record<string, string> = {
  COMPLETE:  'var(--success)',
  SCREENOUT: 'var(--warning)',
};

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
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{data?.totalElements ?? 0} total events</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-s btn-sm"
            onClick={() => void responseApi.export(surveyId, 'csv')}
          >
            Export CSV
          </button>
          <button
            className="btn btn-s btn-sm"
            onClick={() => void responseApi.export(surveyId, 'excel')}
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
                  <th>Occurred at</th>
                  <th>Event</th>
                  <th>Respondent ID</th>
                  <th>Fusion survey ID</th>
                  <th>CPI</th>
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
                      <td style={{ color: 'var(--muted)' }}>{new Date(r.occurredAt).toLocaleString()}</td>
                      <td>
                        <span style={{ fontWeight: 600, fontSize: 12, color: EVENT_COLOR[r.eventType] ?? 'var(--text)' }}>
                          {r.eventType}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--muted)' }}>{r.respondentId}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--muted)' }}>{r.fusionSurveyId}</td>
                      <td style={{ color: 'var(--muted)' }}>
                        {r.cpi != null ? `$${r.cpi.toFixed(2)}` : '—'}
                      </td>
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

      {selected && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{ background: 'var(--surface)', borderRadius: 12, padding: 24, maxWidth: 440, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,.3)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 4 }}>Response detail</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>{new Date(selected.occurredAt).toLocaleString()}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 13 }}>
              <div><span style={{ color: 'var(--muted)' }}>Event:</span> <strong style={{ color: EVENT_COLOR[selected.eventType] ?? 'var(--text)' }}>{selected.eventType}</strong></div>
              <div><span style={{ color: 'var(--muted)' }}>CPI:</span> <strong>{selected.cpi != null ? `$${selected.cpi.toFixed(2)}` : '—'}</strong></div>
              <div style={{ gridColumn: '1/-1' }}><span style={{ color: 'var(--muted)' }}>Respondent:</span> <span style={{ fontFamily: 'monospace' }}>{selected.respondentId}</span></div>
              <div style={{ gridColumn: '1/-1' }}><span style={{ color: 'var(--muted)' }}>Fusion survey:</span> <span style={{ fontFamily: 'monospace' }}>{selected.fusionSurveyId}</span></div>
            </div>
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <button className="btn btn-s btn-sm" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
