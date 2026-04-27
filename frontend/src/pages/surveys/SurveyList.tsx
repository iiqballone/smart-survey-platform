import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SurveyStatusBadge } from '@/components/survey/SurveyStatusBadge';
import { Spinner } from '@/components/common/Spinner';
import { useSurveys, useDeleteSurvey } from '@/hooks/useSurveys';
import { useAuth } from '@/hooks/useAuth';
import type { SurveyStatus } from '@/types';

const FILTERS: Array<{ label: string; value: SurveyStatus | 'ALL' }> = [
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

  return (
    <div>
      <div className="sh">
        <div className="st">Surveys</div>
        {canEdit && (
          <button className="btn btn-p btn-sm" onClick={() => navigate('/surveys/new')}>+ New Survey</button>
        )}
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`tab${statusFilter === f.value ? ' on' : ''}`}
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isPending ? (
        <div className="center-spinner"><Spinner size="lg" /></div>
      ) : (
        <div className="tw">
          <div className="tscroll">
            <table>
              <thead>
                <tr>
                  <th>Survey</th>
                  <th>Status</th>
                  <th>Country</th>
                  <th>Progress</th>
                  <th>Responses</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(data?.content ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
                      No surveys found.
                    </td>
                  </tr>
                ) : (
                  (data?.content ?? []).map((s) => {
                    const pct = s.completesRequired > 0
                      ? Math.min(100, (s.completedCount / s.completesRequired) * 100)
                      : 0;
                    return (
                      <tr key={s.id}>
                        <td>
                          <div className="sn">
                            <Link to={`/surveys/${s.id}`} style={{ color: 'var(--text)', textDecoration: 'none' }}>
                              {s.title}
                            </Link>
                          </div>
                          {s.fusionSurveyId && (
                            <div className="sm" style={{ fontFamily: 'monospace' }}>{s.fusionSurveyId}</div>
                          )}
                        </td>
                        <td><SurveyStatusBadge status={s.status} /></td>
                        <td style={{ color: 'var(--muted)' }}>{s.country}</td>
                        <td>
                          <div className="pbar"><div className="pfill" style={{ width: `${pct}%` }} /></div>
                          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>{pct.toFixed(0)}%</div>
                        </td>
                        <td style={{ color: 'var(--muted)' }}>
                          {s.completedCount.toLocaleString()}
                          <span style={{ opacity: 0.5 }}> / {s.completesRequired.toLocaleString()}</span>
                        </td>
                        <td style={{ color: 'var(--muted)' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="acts">
                            <button className="btn btn-s btn-xs" onClick={() => navigate(`/surveys/${s.id}/responses`)}>
                              Responses
                            </button>
                            {canEdit && s.status === 'DRAFT' && (
                              <button className="btn btn-s btn-xs" onClick={() => navigate(`/surveys/${s.id}/edit`)}>
                                Edit
                              </button>
                            )}
                            {canEdit && (
                              <button
                                className="btn btn-d btn-xs"
                                onClick={() => { if (confirm('Delete this survey?')) deleteMutation.mutate(s.id); }}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
