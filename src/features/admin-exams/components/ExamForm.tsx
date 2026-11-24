import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '@/shared/api/getErrorMessage';
import { path } from '@/shared/config/paths';
import type { ExamInput } from '@/shared/types';
import { Alert, Button, buttonClass, Card, Field } from '@/shared/ui';
import { createQuestion, examSchema } from '../model/examSchema';
import { QuestionEditor } from './QuestionEditor';

interface ExamFormProps {
  defaultValues: ExamInput;
  isSaving: boolean;
  error: unknown;
  onSubmit: (input: ExamInput) => void;
}

export function ExamForm({ defaultValues, isSaving, error, onSubmit }: ExamFormProps) {
  const form = useForm<ExamInput>({ resolver: zodResolver(examSchema), defaultValues });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;
  // Questions have their own `id`, which the default keyName ("id") would overwrite.
  const questions = useFieldArray({ control, name: 'questions', keyName: 'fieldKey' });
  const questionsError = errors.questions?.root?.message ?? errors.questions?.message;

  return (
    <FormProvider {...form}>
      <form noValidate className="space-y-6" onSubmit={handleSubmit((values) => onSubmit(values))}>
        <Card className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" error={errors.title?.message}>
            {(props) => <input {...props} {...register('title')} />}
          </Field>
          <Field label="Subject" error={errors.subject?.message}>
            {(props) => <input {...props} {...register('subject')} />}
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description" error={errors.description?.message}>
              {(props) => <textarea {...props} rows={2} {...register('description')} />}
            </Field>
          </div>
          <Field label="Duration (minutes)" error={errors.durationMinutes?.message}>
            {(props) => (
              <input
                {...props}
                type="number"
                {...register('durationMinutes', { valueAsNumber: true })}
              />
            )}
          </Field>
          <Field label="Pass mark (%)" error={errors.passPercentage?.message}>
            {(props) => (
              <input
                {...props}
                type="number"
                {...register('passPercentage', { valueAsNumber: true })}
              />
            )}
          </Field>
          <Field
            label="Negative marking"
            error={errors.negativeMarking?.message}
            hint="Fraction of marks deducted for a wrong answer. 0 for none."
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
          <Field label="Status" hint="Students only see published exams.">
            {(props) => (
              <select {...props} {...register('status')}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            )}
          </Field>
        </Card>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Questions ({questions.fields.length})</h2>
          {questionsError && <Alert>{questionsError}</Alert>}
          {questions.fields.map((field, index) => (
            <QuestionEditor
              key={field.fieldKey}
              index={index}
              onRemove={() => questions.remove(index)}
            />
          ))}
          <Button variant="secondary" onClick={() => questions.append(createQuestion())}>
            Add question
          </Button>
        </section>

        {Boolean(error) && <Alert>{getErrorMessage(error)}</Alert>}
        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Link to={path.adminExams} className={buttonClass('secondary')}>
            Cancel
          </Link>
          <Button type="submit" isLoading={isSaving}>
            Save exam
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
