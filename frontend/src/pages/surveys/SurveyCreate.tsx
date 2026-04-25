import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { useCreateSurvey } from '@/hooks/useSurveys';
import type { QuestionType } from '@/types';

const QUESTION_TYPES: Array<{ value: QuestionType; label: string }> = [
  { value: 'SINGLE_CHOICE', label: 'Single Choice' },
  { value: 'MULTI_CHOICE',  label: 'Multi Choice'  },
  { value: 'RATING',        label: 'Rating Scale'  },
  { value: 'OPEN_TEXT',     label: 'Open Text'     },
  { value: 'NPS',           label: 'NPS'           },
  { value: 'MATRIX',        label: 'Matrix'        },
];

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'CA', label: 'Canada' },
  { value: 'DE', label: 'Germany' },
];

const schema = z.object({
  title: z.string().min(3, 'At least 3 characters'),
  description: z.string().min(10, 'At least 10 characters'),
  targeting: z.object({
    country:       z.string().min(1),
    ageMin:        z.coerce.number().min(16).max(99),
    ageMax:        z.coerce.number().min(16).max(99),
    gender:        z.enum(['ALL', 'MALE', 'FEMALE']),
    sampleSize:    z.coerce.number().min(50),
    incidenceRate: z.coerce.number().min(1).max(100),
  }),
  questions: z.array(z.object({
    text:     z.string().min(5, 'At least 5 characters'),
    type:     z.enum(['SINGLE_CHOICE','MULTI_CHOICE','RATING','OPEN_TEXT','NPS','MATRIX']),
    required: z.boolean(),
    options:  z.string().optional(),
  })).min(1, 'Add at least one question'),
});

type FormValues = z.infer<typeof schema>;

const STEPS = ['details', 'targeting', 'questions'] as const;
type Step = typeof STEPS[number];

export function SurveyCreate() {
  const navigate = useNavigate();
  const create = useCreateSurvey();
  const [step, setStep] = useState<Step>('details');

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
        text: q.text, type: q.type, required: q.required,
        options: q.options ? q.options.split('\n').map((s) => s.trim()).filter(Boolean) : undefined,
      })),
    }, {
      onSuccess: (survey) => navigate(`/surveys/${survey.id}`),
    });
  };

  return (
    <div className="fw">
      <div className="sh">
        <div className="st">New Survey</div>
        <button className="btn btn-s btn-sm" onClick={() => navigate('/surveys')}>Cancel</button>
      </div>

      <div className="tabs">
        {STEPS.map((s, i) => (
          <button key={s} className={`tab${step === s ? ' on' : ''}`} onClick={() => setStep(s)}>
            {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 'details' && (
          <div className="fsec">
            <div className="fst"><span className="fsi">📋</span> Survey details</div>
            <div className="frow one">
              <Input label="Survey title" error={errors.title?.message} {...register('title')} />
            </div>
            <div className="frow one">
              <div className="fg">
                <label className="fl">Description</label>
                <textarea className="fta" rows={4} style={errors.description ? { borderColor: 'var(--danger)' } : undefined} {...register('description')} />
                {errors.description && <p className="ferr">{errors.description.message}</p>}
              </div>
            </div>
            <div className="factions">
              <button type="button" className="btn btn-p" onClick={() => setStep('targeting')}>
                Next: Targeting →
              </button>
            </div>
          </div>
        )}

        {step === 'targeting' && (
          <div className="fsec">
            <div className="fst"><span className="fsi">🎯</span> Targeting</div>
            <div className="frow">
              <Select label="Country" options={COUNTRIES} {...register('targeting.country')} />
              <Select label="Gender" options={[
                { value: 'ALL', label: 'All genders' },
                { value: 'MALE', label: 'Male' },
                { value: 'FEMALE', label: 'Female' },
              ]} {...register('targeting.gender')} />
            </div>
            <div className="frow">
              <Input label="Min age" type="number" error={errors.targeting?.ageMin?.message} {...register('targeting.ageMin')} />
              <Input label="Max age" type="number" error={errors.targeting?.ageMax?.message} {...register('targeting.ageMax')} />
            </div>
            <div className="frow">
              <Input label="Sample size" type="number" hint="Target number of responses" {...register('targeting.sampleSize')} />
              <Input label="Incidence rate (%)" type="number" hint="Expected % of eligible respondents" {...register('targeting.incidenceRate')} />
            </div>
            <div className="factions">
              <button type="button" className="btn btn-s" onClick={() => setStep('details')}>← Back</button>
              <button type="button" className="btn btn-p" onClick={() => setStep('questions')}>Next: Questions →</button>
            </div>
          </div>
        )}

        {step === 'questions' && (
          <div>
            {fields.map((field, i) => (
              <div key={field.id} className="qcard">
                <div className="qhead">
                  <div className="qnum">{i + 1}</div>
                  <div className="qrow" style={{ flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>Question {i + 1}</span>
                      {fields.length > 1 && (
                        <button type="button" className="btn btn-d btn-xs" onClick={() => remove(i)}>Remove</button>
                      )}
                    </div>
                    <Input label="Question text" error={errors.questions?.[i]?.text?.message} {...register(`questions.${i}.text`)} />
                    <Select label="Type" options={QUESTION_TYPES} {...register(`questions.${i}.type`)} />
                    <div className="fg">
                      <label className="fl">Options <span style={{ fontWeight: 400 }}>(one per line)</span></label>
                      <textarea className="fta" rows={3} {...register(`questions.${i}.options`)} />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text)', cursor: 'pointer' }}>
                      <input type="checkbox" {...register(`questions.${i}.required`)} />
                      Required
                    </label>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="addq"
              onClick={() => append({ text: '', type: 'SINGLE_CHOICE', required: false, options: '' })}
            >
              + Add Question
            </button>

            {errors.questions?.root && <p className="ferr" style={{ marginTop: 8 }}>{errors.questions.root.message}</p>}

            <div className="factions" style={{ marginTop: 16 }}>
              <button type="button" className="btn btn-s" onClick={() => setStep('targeting')}>← Back</button>
              <button type="submit" className="btn btn-p" disabled={create.isPending}>
                {create.isPending && <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />}
                Create Survey
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
