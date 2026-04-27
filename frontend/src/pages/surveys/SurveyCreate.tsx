import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { useCreateSurvey } from '@/hooks/useSurveys';

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
  completesRequired: z.coerce.number().min(1, 'At least 1'),
  loi:               z.coerce.number().min(1, 'At least 1 minute'),
  country:           z.string().min(2).max(2),
  cpiMin:            z.coerce.number().min(0, 'Must be ≥ 0'),
  cpiMax:            z.coerce.number().min(0, 'Must be ≥ 0'),
  callbackUrl:       z.string().url('Must be a valid URL'),
}).refine((d) => d.cpiMax >= d.cpiMin, { message: 'Max CPI must be ≥ min CPI', path: ['cpiMax'] });

type FormValues = z.infer<typeof schema>;

export function SurveyCreate() {
  const navigate = useNavigate();
  const create = useCreateSurvey();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      country: 'US',
      completesRequired: 500,
      loi: 10,
      cpiMin: 2.0,
      cpiMax: 4.0,
    },
  });

  const onSubmit = (values: FormValues) => {
    create.mutate({
      title:             values.title,
      surveyUrl:         values.surveyUrl,
      completesRequired: values.completesRequired,
      loi:               values.loi,
      country:           values.country,
      cpiRange:          { min: values.cpiMin, max: values.cpiMax },
      callbackUrl:       values.callbackUrl,
    }, {
      onSuccess: (survey) => navigate(`/surveys/${survey.id}`),
    });
  };

  return (
    <div>
      <div className="sh">
        <div className="st">New Survey</div>
        <button className="btn btn-s btn-sm" onClick={() => navigate('/surveys')}>Cancel</button>
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
              hint="Must contain {rid} placeholder, e.g. https://www.surveymonkey.com/r/ABC123?rid={rid}"
              error={errors.surveyUrl?.message}
              {...register('surveyUrl')}
            />
          </div>
          <div className="frow one">
            <Input
              label="Callback URL"
              hint="Webhook URL to receive completion/screenout events"
              error={errors.callbackUrl?.message}
              {...register('callbackUrl')}
            />
          </div>
        </div>

        <div className="fsec">
          <div className="fst">Sampling configuration</div>
          <div className="frow">
            <Select label="Country" options={COUNTRIES} {...register('country')} />
            <Input
              label="Target completes"
              type="number"
              hint="Number of completions to collect"
              error={errors.completesRequired?.message}
              {...register('completesRequired')}
            />
          </div>
          <div className="frow">
            <Input
              label="Length of interview (min)"
              type="number"
              hint="Expected survey duration in minutes"
              error={errors.loi?.message}
              {...register('loi')}
            />
          </div>
          <div className="frow">
            <Input
              label="CPI min (USD)"
              type="number"
              hint="Minimum cost per interview"
              error={errors.cpiMin?.message}
              {...register('cpiMin')}
            />
            <Input
              label="CPI max (USD)"
              type="number"
              hint="Maximum cost per interview"
              error={errors.cpiMax?.message}
              {...register('cpiMax')}
            />
          </div>
        </div>

        <div className="factions">
          <button type="submit" className="btn btn-p" disabled={create.isPending}>
            {create.isPending && <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />}
            Create Survey
          </button>
        </div>
      </form>
    </div>
  );
}
