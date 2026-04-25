import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { useSurvey, useUpdateSurvey } from '@/hooks/useSurveys';

const schema = z.object({
  title:       z.string().min(3),
  description: z.string().min(10),
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

  if (isPending) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!survey) return <p className="text-gray-500">Survey not found.</p>;
  if (survey.status !== 'DRAFT') {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500">Only draft surveys can be edited.</p>
        <Button className="mt-4" variant="secondary" onClick={() => navigate(`/surveys/${id}`)}>Back</Button>
      </div>
    );
  }

  const onSubmit = (values: FormValues) => {
    update.mutate(values, { onSuccess: () => navigate(`/surveys/${id}`) });
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Edit Survey"
        actions={<Button variant="secondary" onClick={() => navigate(`/surveys/${id}`)}>Cancel</Button>}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="card-padded space-y-4">
        <Input label="Survey title" error={errors.title?.message} {...register('title')} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea rows={4} className="input" {...register('description')} />
          {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={update.isPending}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
