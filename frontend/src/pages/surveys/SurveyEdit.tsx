import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/common/Spinner';
import { useSurvey, useUpdateSurvey } from '@/hooks/useSurveys';

const schema = z.object({
  title:       z.string().min(3, 'At least 3 characters'),
  description: z.string().min(10, 'At least 10 characters'),
});

type FormValues = z.infer<typeof schema>;

export function SurveyEdit() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: survey, isPending } = useSurvey(id);
  const update = useUpdateSurvey(id);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (survey) reset({ title: survey.title, description: survey.description });
  }, [survey, reset]);

  if (isPending) return <div className="center-spinner"><Spinner size="lg" /></div>;
  if (!survey)   return <p style={{ color: 'var(--muted)' }}>Survey not found.</p>;

  if (survey.status !== 'DRAFT') {
    return (
      <div className="empty">
        <div className="ei">🔒</div>
        <div className="et">Only draft surveys can be edited.</div>
        <button className="btn btn-s btn-sm" style={{ marginTop: 12 }} onClick={() => navigate(`/surveys/${id}`)}>
          Back to survey
        </button>
      </div>
    );
  }

  const onSubmit = (values: FormValues) => {
    update.mutate(values, { onSuccess: () => navigate(`/surveys/${id}`) });
  };

  return (
    <div className="fw">
      <div className="sh">
        <div className="st">Edit Survey</div>
        <button className="btn btn-s btn-sm" onClick={() => navigate(`/surveys/${id}`)}>Cancel</button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="fsec">
          <div className="fst"><span className="fsi">📋</span> Survey details</div>
          <div className="frow one">
            <Input label="Survey title" error={errors.title?.message} {...register('title')} />
          </div>
          <div className="frow one">
            <div className="fg">
              <label className="fl">Description</label>
              <textarea
                className="fta"
                rows={4}
                style={errors.description ? { borderColor: 'var(--danger)' } : undefined}
                {...register('description')}
              />
              {errors.description && <p className="ferr">{errors.description.message}</p>}
            </div>
          </div>
          <div className="factions">
            <button type="submit" className="btn btn-p" disabled={update.isPending}>
              {update.isPending && <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />}
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
