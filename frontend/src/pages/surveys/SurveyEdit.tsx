import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Spinner } from '@/components/common/Spinner';
import { useSurvey, useUpdateSurvey } from '@/hooks/useSurveys';

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'CA', label: 'Canada' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'JP', label: 'Japan' },
];

const schema = z.object({
  title:             z.string().min(3, 'At least 3 characters'),
  surveyUrl:         z.string().url('Must be a valid URL').includes('{rid}', { message: 'URL must contain {rid} placeholder' }),
  completesRequired: z.coerce.number().min(1),
  loi:               z.coerce.number().min(1),
  country:           z.string().min(2).max(2),
  cpiMin:            z.coerce.number().min(0),
  cpiMax:            z.coerce.number().min(0),
  callbackUrl:       z.string().url('Must be a valid URL'),
}).refine((d) => d.cpiMax >= d.cpiMin, { message: 'Max CPI must be ≥ min CPI', path: ['cpiMax'] });

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
    if (survey) {
      reset({
        title:             survey.title,
        surveyUrl:         survey.surveyUrl,
        completesRequired: survey.completesRequired,
        loi:               survey.loi,
        country:           survey.country,
        cpiMin:            survey.cpiMin,
        cpiMax:            survey.cpiMax,
        callbackUrl:       survey.callbackUrl,
      });
    }
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
    update.mutate(
      { title: values.title, surveyUrl: values.surveyUrl, completesRequired: values.completesRequired, loi: values.loi, country: values.country, cpiRange: { min: values.cpiMin, max: values.cpiMax }, callbackUrl: values.callbackUrl },
      { onSuccess: () => navigate(`/surveys/${id}`) },
    );
  };

  return (
    <div className="fw">
      <div className="sh">
        <div className="st">Edit Survey</div>
        <button className="btn btn-s btn-sm" onClick={() => navigate(`/surveys/${id}`)}>Cancel</button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="fsec">
          <div className="fst">Survey details</div>
          <div className="frow one">
            <Input label="Survey title" error={errors.title?.message} {...register('title')} />
          </div>
          <div className="frow one">
            <Input
              label="SurveyMonkey URL"
              hint="Must contain {rid} placeholder"
              error={errors.surveyUrl?.message}
              {...register('surveyUrl')}
            />
          </div>
          <div className="frow one">
            <Input label="Callback URL" error={errors.callbackUrl?.message} {...register('callbackUrl')} />
          </div>
        </div>

        <div className="fsec">
          <div className="fst">Sampling configuration</div>
          <div className="frow">
            <Select label="Country" options={COUNTRIES} {...register('country')} />
            <Input label="Target completes" type="number" error={errors.completesRequired?.message} {...register('completesRequired')} />
          </div>
          <div className="frow">
            <Input label="LOI (min)" type="number" error={errors.loi?.message} {...register('loi')} />
          </div>
          <div className="frow">
            <Input label="CPI min (USD)" type="number" error={errors.cpiMin?.message} {...register('cpiMin')} />
            <Input label="CPI max (USD)" type="number" error={errors.cpiMax?.message} {...register('cpiMax')} />
          </div>
        </div>

        <div className="factions">
          <button type="submit" className="btn btn-p" disabled={update.isPending}>
            {update.isPending && <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
