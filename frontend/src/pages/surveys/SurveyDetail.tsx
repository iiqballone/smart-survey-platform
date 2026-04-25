import { useParams, useNavigate } from 'react-router-dom';
import { SurveyStatusBadge } from '@/components/survey/SurveyStatusBadge';
import { Spinner } from '@/components/common/Spinner';
import { useSurvey, usePublishSurvey, usePauseSurvey, useCloseSurvey } from '@/hooks/useSurveys';
import { useAuth } from '@/hooks/useAuth';

export function SurveyDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canEdit = hasRole('CLIENT_ADMIN') || hasRole('PLATFORM_ADMIN');

  const { data: survey, isPending } = useSurvey(id);
  const publish = usePublishSurvey();
  const pause   = usePauseSurvey();
  const close   = useCloseSurvey();

  if (isPending) return <div className="center-spinner"><Spinner size="lg" /></div>;
  if (!survey)   return <p style={{ color: 'var(--muted)' }}>Survey not found.</p>;

  const pct = survey.targetResponseCount > 0
    ? Math.min(100, (survey.receivedResponseCount / survey.targetResponseCount) * 100)
    : 0;

  return (
    <div className="fw">
      <div className="sh">
        <div>
          <div className="st">{survey.title}</div>
          {survey.description && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{survey.description}</div>}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {canEdit && survey.status === 'DRAFT' && (
            <>
              <button className="btn btn-s btn-sm" onClick={() => navigate(`/surveys/${id}/edit`)}>Edit</button>
              <button className="btn btn-p btn-sm" onClick={() => publish.mutate(id)} disabled={publish.isPending}>
                {publish.isPending ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> : null}
                Publish
              </button>
            </>
          )}
          {canEdit && survey.status === 'LIVE' && (
            <>
              <button className="btn btn-s btn-sm" onClick={() => pause.mutate(id)} disabled={pause.isPending}>Pause</button>
              <button className="btn btn-d btn-sm" onClick={() => close.mutate(id)} disabled={close.isPending}>Close</button>
            </>
          )}
          {canEdit && survey.status === 'PAUSED' && (
            <button className="btn btn-p btn-sm" onClick={() => publish.mutate(id)} disabled={publish.isPending}>Resume</button>
          )}
          <button className="btn btn-s btn-sm" onClick={() => navigate(`/surveys/${id}/responses`)}>Responses</button>
          <button className="btn btn-s btn-sm" onClick={() => navigate(`/surveys/${id}/reports`)}>Report</button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="kcard">
          <div className="klbl">Status</div>
          <div style={{ marginTop: 6 }}><SurveyStatusBadge status={survey.status} /></div>
        </div>
        <div className="kcard">
          <div className="klbl">Responses</div>
          <div className="kval" style={{ fontSize: 20 }}>
            {survey.receivedResponseCount.toLocaleString()}
            <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 400 }}> / {survey.targetResponseCount.toLocaleString()}</span>
          </div>
        </div>
        <div className="kcard">
          <div className="klbl">Published</div>
          <div style={{ fontSize: 14, color: 'var(--text)', marginTop: 8 }}>
            {survey.publishedAt ? new Date(survey.publishedAt).toLocaleDateString() : '—'}
          </div>
        </div>
        <div className="kcard">
          <div className="klbl">Dynata ID</div>
          <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text)', marginTop: 8 }}>{survey.dynataProjectId ?? '—'}</div>
        </div>
      </div>

      <div className="fsec" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
          <span>Progress</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
        <div className="pbar" style={{ width: '100%' }}>
          <div className="pfill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {survey.targeting && (
        <div className="fsec">
          <div className="fst"><span className="fsi">🎯</span> Targeting</div>
          <div className="frow three">
            <div className="fg">
              <span className="fl">Country</span>
              <span style={{ fontSize: 13, color: 'var(--text)' }}>{survey.targeting.country}</span>
            </div>
            <div className="fg">
              <span className="fl">Age range</span>
              <span style={{ fontSize: 13, color: 'var(--text)' }}>{survey.targeting.ageMin}–{survey.targeting.ageMax}</span>
            </div>
            <div className="fg">
              <span className="fl">Gender</span>
              <span style={{ fontSize: 13, color: 'var(--text)' }}>{survey.targeting.gender}</span>
            </div>
            <div className="fg">
              <span className="fl">Sample size</span>
              <span style={{ fontSize: 13, color: 'var(--text)' }}>{survey.targeting.sampleSize.toLocaleString()}</span>
            </div>
            <div className="fg">
              <span className="fl">Incidence rate</span>
              <span style={{ fontSize: 13, color: 'var(--text)' }}>{survey.targeting.incidenceRate}%</span>
            </div>
          </div>
        </div>
      )}

      {survey.questions && survey.questions.length > 0 && (
        <div>
          <div className="sh" style={{ marginBottom: 12 }}>
            <div className="st">Questions ({survey.questions.length})</div>
          </div>
          {survey.questions.map((q, i) => (
            <div key={q.id} className="qcard">
              <div className="qhead">
                <div className="qnum">{i + 1}</div>
                <div className="qrow">
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{q.text}</span>
                  <span className="tag">{q.type.replace('_', ' ')}</span>
                  {q.required && <span style={{ fontSize: 11, color: 'var(--muted)' }}>Required</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
