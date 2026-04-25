import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { useCreateSurvey } from '@/hooks/useSurveys';
import type { QuestionType } from '@/types';

const QUESTION_TYPES: Array<{ value: QuestionType; label: string }> = [
  { value: 'SINGLE_CHOICE', label: 'Single Choice' },
  { value: 'MULTI_CHOICE',  label: 'Multi Choice' },
  { value: 'RATING',        label: 'Rating Scale' },
  { value: 'OPEN_TEXT',     label: 'Open Text' },
  { value: 'NPS',           label: 'NPS' },
  { value: 'MATRIX',        label: 'Matrix' },
];

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'CA', label: 'Canada' },
  { value: 'DE', label: 'Germany' },
];

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  targeting: z.object({
    country:      z.string().min(1),
    ageMin:       z.coerce.number().min(16).max(99),
    ageMax:       z.coerce.number().min(16).max(99),
    gender:       z.enum(['ALL', 'MALE', 'FEMALE']),
    sampleSize:   z.coerce.number().min(50),
    incidenceRate:z.coerce.number().min(1).max(100),
  }),
  questions: z.array(z.object({
    text:     z.string().min(5, 'Question must be at least 5 characters'),
    type:     z.enum(['SINGLE_CHOICE','MULTI_CHOICE','RATING','OPEN_TEXT','NPS','MATRIX']),
    required: z.boolean(),
    options:  z.string().optional(),
  })).min(1, 'Add at least one question'),
});

type FormValues = z.infer<typeof schema>;

export function SurveyCreate() {
  const navigate = useNavigate();
  const create = useCreateSurvey();
  const [step, setStep] = useState<'details' | 'targeting' | 'questions'>('details');

  const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      targeting: { country: 'US', ageMin: 18, ageMax: 65, gender: 'ALL', sampleSize: 500, incidenceRate: 50 },
      questions: [{ text: '', type: 'SINGLE_CHOICE', required: true, options: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'questions' });

  const onSubmit = (values: FormValues) => {
    create.mutate({
      title:       values.title,
      description: values.description,
      targeting:   values.targeting,
      questions:   values.questions.map((q) => ({
        text:     q.text,
        type:     q.type,
        required: q.required,
        options:  q.options ? q.options.split('\n').map((s) => s.trim()).filter(Boolean) : undefined,
      })),
    }, {
      onSuccess: (survey) => navigate(`/surveys/${survey.id}`),
    });
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="New Survey"
        subtitle="Fill in details, targeting, and questions"
        actions={
          <Button variant="secondary" onClick={() => navigate('/surveys')}>
            Cancel
          </Button>
        }
      />

      {/* Step tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {(['details', 'targeting', 'questions'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors
              ${step === s ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 'details' && (
          <div className="card-padded space-y-4">
            <Input label="Survey title" error={errors.title?.message} {...register('title')} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={4}
                className={`input ${errors.description ? 'input-error' : ''}`}
                {...register('description')}
              />
              {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={() => setStep('targeting')}>Next: Targeting →</Button>
            </div>
          </div>
        )}

        {step === 'targeting' && (
          <div className="card-padded space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Country"
                options={COUNTRIES}
                {...register('targeting.country')}
              />
              <Select
                label="Gender"
                options={[
                  { value: 'ALL', label: 'All' },
                  { value: 'MALE', label: 'Male' },
                  { value: 'FEMALE', label: 'Female' },
                ]}
                {...register('targeting.gender')}
              />
              <Input label="Min age" type="number" error={errors.targeting?.ageMin?.message} {...register('targeting.ageMin')} />
              <Input label="Max age" type="number" error={errors.targeting?.ageMax?.message} {...register('targeting.ageMax')} />
              <Input label="Sample size" type="number" hint="Number of completed responses" {...register('targeting.sampleSize')} />
              <Input label="Incidence rate (%)" type="number" hint="Expected % of eligible respondents" {...register('targeting.incidenceRate')} />
            </div>
            <div className="flex justify-between">
              <Button type="button" variant="secondary" onClick={() => setStep('details')}>← Back</Button>
              <Button type="button" onClick={() => setStep('questions')}>Next: Questions →</Button>
            </div>
          </div>
        )}

        {step === 'questions' && (
          <div className="space-y-4">
            {fields.map((field, i) => (
              <div key={field.id} className="card-padded space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Question {i + 1}</span>
                  {fields.length > 1 && (
                    <Button type="button" size="sm" variant="ghost" onClick={() => remove(i)}>Remove</Button>
                  )}
                </div>
                <Input
                  label="Question text"
                  error={errors.questions?.[i]?.text?.message}
                  {...register(`questions.${i}.text`)}
                />
                <Select
                  label="Type"
                  options={QUESTION_TYPES}
                  {...register(`questions.${i}.type`)}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Options <span className="font-normal text-gray-400">(one per line)</span>
                  </label>
                  <textarea rows={3} className="input" {...register(`questions.${i}.options`)} />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" {...register(`questions.${i}.required`)} />
                  Required
                </label>
              </div>
            ))}

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => append({ text: '', type: 'SINGLE_CHOICE', required: false, options: '' })}
            >
              + Add Question
            </Button>

            {errors.questions?.root && (
              <p className="text-sm text-red-600">{errors.questions.root.message}</p>
            )}

            <div className="flex justify-between">
              <Button type="button" variant="secondary" onClick={() => setStep('targeting')}>← Back</Button>
              <Button type="submit" loading={create.isPending}>Create Survey</Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
