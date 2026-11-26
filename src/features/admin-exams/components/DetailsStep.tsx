import clsx from 'clsx';
import { useFormContext, useWatch } from 'react-hook-form';
import type { ExamInput } from '@/shared/types';
import { Card, Field } from '@/shared/ui';

const statuses = [
  { value: 'draft', label: 'Draft', hint: 'Only staff can see it.' },
  { value: 'published', label: 'Published', hint: 'Students can take it.' },
] as const;

export function DetailsStep() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ExamInput>();
  const status = useWatch({ control, name: 'status' });

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[1fr_22rem]">
      <Card className="grid gap-4 sm:grid-cols-2">
        <h2 className="font-bold sm:col-span-2">Exam Details</h2>
        <Field label="Title" required error={errors.title?.message}>
          {(props) => (
            <input
              {...props}
              placeholder="e.g. APPSC Group-II Services – Screening Test"
              {...register('title')}
            />
          )}
        </Field>
        <Field label="Subject" required error={errors.subject?.message}>
          {(props) => (
            <input {...props} placeholder="e.g. Computer Skills" {...register('subject')} />
          )}
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description" hint="Shown to students before they start.">
            {(props) => <textarea {...props} rows={3} {...register('description')} />}
          </Field>
        </div>
      </Card>
      <div className="space-y-5">
        <Card className="space-y-4">
          <h2 className="font-bold">Rules</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Duration (minutes)" required error={errors.durationMinutes?.message}>
              {(props) => (
                <input
                  {...props}
                  type="number"
                  {...register('durationMinutes', { valueAsNumber: true })}
                />
              )}
            </Field>
            <Field label="Pass mark (%)" required error={errors.passPercentage?.message}>
              {(props) => (
                <input
                  {...props}
                  type="number"
                  {...register('passPercentage', { valueAsNumber: true })}
                />
              )}
            </Field>
          </div>
          <Field
            label="Negative marking"
            error={errors.negativeMarking?.message}
            hint="Share of a question's marks lost for a wrong answer, e.g. 0.25. 0 for none."
          >
            {(props) => (
              <input
                {...props}
                type="number"
                step="any"
                {...register('negativeMarking', { valueAsNumber: true })}
              />
            )}
          </Field>
        </Card>
        <Card>
          <fieldset>
            <legend className="mb-3 font-bold">Status</legend>
            <div className="grid grid-cols-2 gap-3">
              {statuses.map(({ value, label, hint }) => (
                <label
                  key={value}
                  className={clsx(
                    'cursor-pointer rounded-lg border px-3 py-2.5',
                    status === value ? 'border-emerald-400 bg-[#d7fcec]' : 'border-line',
                  )}
                >
                  <span className="flex items-center gap-2 font-medium">
                    <input
                      type="radio"
                      value={value}
                      className="size-4 accent-brand-700"
                      {...register('status')}
                    />
                    {label}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">{hint}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </Card>
      </div>
    </div>
  );
}
