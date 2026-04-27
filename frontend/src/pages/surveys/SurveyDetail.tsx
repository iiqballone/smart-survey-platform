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

  const pct = survey.completesRequired > 0
    ? Math.min(100, (survey.completedCount / survey.completesRequired) * 100)
    : 0;

  return (
    <div className="fw">
      <div className="sh">
        <div>
          <div className="st">{survey.title}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
            {survey.country} · LOI {survey.loi} min · CPI ${survey.cpiMin}–${survey.cpiMax}
          </div>
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
          <div className="klbl">Completes</div>
          <div className="kval" style={{ fontSize: 20 }}>
            {survey.completedCount.toLocaleString()}
            <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 400 }}> / {survey.completesRequired.toLocaleString()}</span>
          </div>
        </div>
        <div className="kcard">
          <div className="klbl">Screenouts</div>
          <div className="kval" style={{ fontSize: 20 }}>{survey.screenoutCount.toLocaleString()}</div>
        </div>
        <div className="kcard">
          <div className="klbl">Published</div>
          <div style={{ fontSize: 14, color: 'var(--text)', marginTop: 8 }}>
            {survey.publishedAt ? new Date(survey.publishedAt).toLocaleDateString() : '—'}
          </div>
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

      <div className="fsec">
        <div className="fst">Survey details</div>
        <div className="frow three">
          <div className="fg">
            <span className="fl">Country</span>
            <span style={{ fontSize: 13, color: 'var(--text)' }}>{survey.country}</span>
          </div>
          <div className="fg">
            <span className="fl">Length of interview</span>
            <span style={{ fontSize: 13, color: 'var(--text)' }}>{survey.loi} min</span>
          </div>
          <div className="fg">
            <span className="fl">CPI range</span>
            <span style={{ fontSize: 13, color: 'var(--text)' }}>${survey.cpiMin} – ${survey.cpiMax}</span>
          </div>
          <div className="fg">
            <span className="fl">Target completes</span>
            <span style={{ fontSize: 13, color: 'var(--text)' }}>{survey.completesRequired.toLocaleString()}</span>
          </div>
          <div className="fg">
            <span className="fl">Fusion survey ID</span>
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text)' }}>{survey.fusionSurveyId ?? '—'}</span>
          </div>
        </div>
      </div>

      {survey.fusionEntryUrl && (
        <div className="fsec">
          <div className="fst">Fusion entry URL</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Share this URL with panel suppliers.</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              readOnly
              value={survey.fusionEntryUrl}
              style={{ flex: 1, fontSize: 12, fontFamily: 'monospace', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)' }}
            />
            <button
              className="btn btn-s btn-sm"
              onClick={() => navigator.clipboard.writeText(survey.fusionEntryUrl!)}
            >
              Copy
            </button>
          </div>
        </div>
      )}

      <div className="fsec">
        <div className="fst">Survey URL</div>
        <div style={{ marginTop: 8 }}>
          <input
            readOnly
            value={survey.surveyUrl}
            style={{ width: '100%', fontSize: 12, fontFamily: 'monospace', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)' }}
          />
        </div>
      </div>
    </div>
  );
}
