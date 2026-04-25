import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/common/Button';
import { SurveyStatusBadge } from '@/components/survey/SurveyStatusBadge';
import { QuestionCard } from '@/components/survey/QuestionCard';
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

  if (isPending) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!survey) return <p className="text-gray-500">Survey not found.</p>;

  const progress = survey.targetResponseCount > 0
    ? Math.min(100, (survey.receivedResponseCount / survey.targetResponseCount) * 100)
    : 0;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={survey.title}
        subtitle={survey.description}
        actions={
          <div className="flex gap-2">
            {canEdit && survey.status === 'DRAFT' && (
              <>
                <Button variant="secondary" onClick={() => navigate(`/surveys/${id}/edit`)}>Edit</Button>
                <Button onClick={() => publish.mutate(id)} loading={publish.isPending}>Publish to Dynata</Button>
              </>
            )}
            {canEdit && survey.status === 'LIVE' && (
              <>
                <Button variant="secondary" onClick={() => pause.mutate(id)} loading={pause.isPending}>Pause</Button>
                <Button variant="danger" onClick={() => close.mutate(id)} loading={close.isPending}>Close</Button>
              </>
            )}
            {canEdit && survey.status === 'PAUSED' && (
              <Button onClick={() => publish.mutate(id)} loading={publish.isPending}>Resume</Button>
            )}
            <Button variant="secondary" onClick={() => navigate(`/surveys/${id}/responses`)}>
              View Responses
            </Button>
          </div>
        }
      />

      {/* Status + Dynata info */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs text-gray-500">Status</p>
          <div className="mt-1"><SurveyStatusBadge status={survey.status} /></div>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Responses</p>
          <p className="mt-1 font-semibold text-gray-900">
            {survey.receivedResponseCount.toLocaleString()} / {survey.targetResponseCount.toLocaleString()}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Published</p>
          <p className="mt-1 text-sm text-gray-700">
            {survey.publishedAt ? new Date(survey.publishedAt).toLocaleDateString() : '—'}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Dynata Project ID</p>
          <p className="mt-1 text-sm font-mono text-gray-700">{survey.dynataProjectId ?? '—'}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{progress.toFixed(0)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div className="h-2 rounded-full bg-primary-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Targeting */}
      {survey.targeting && (
        <div className="card-padded mb-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Targeting</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-gray-500">Country: </span>{survey.targeting.country}</div>
            <div><span className="text-gray-500">Age: </span>{survey.targeting.ageMin}–{survey.targeting.ageMax}</div>
            <div><span className="text-gray-500">Gender: </span>{survey.targeting.gender}</div>
            <div><span className="text-gray-500">Sample size: </span>{survey.targeting.sampleSize}</div>
            <div><span className="text-gray-500">Incidence rate: </span>{survey.targeting.incidenceRate}%</div>
          </div>
        </div>
      )}

      {/* Questions */}
      {survey.questions && survey.questions.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Questions ({survey.questions.length})</h2>
          <div className="space-y-3">
            {survey.questions.map((q, i) => (
              <QuestionCard key={q.id} question={q} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
