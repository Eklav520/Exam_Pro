import { zodResolver } from '@hookform/resolvers/zod';
import { nanoid } from '@reduxjs/toolkit';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { useState } from 'react';
import { FormProvider, useFieldArray, useForm, type FieldErrors } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { TaskDialog } from '@/features/question-papers';
import { getErrorMessage } from '@/shared/api/getErrorMessage';
import { path } from '@/shared/config/paths';
import type { ExamInput, PracticalTask, Question } from '@/shared/types';
import { Alert, Button, buttonClass, ItemTable, Stepper } from '@/shared/ui';
import { createQuestion, detailFields, examSchema } from '../model/examSchema';
import { DetailsStep } from './DetailsStep';
import { QuestionDialog } from './QuestionDialog';
import { ReviewStep } from './ReviewStep';

const steps = ['Exam Details', 'Part A – MCQ', 'Part B – Practical', 'Review'] as const;

interface ExamFormProps {
  defaultValues: ExamInput;
  isSaving: boolean;
  error: unknown;
  onSubmit: (input: ExamInput) => void;
}

type OpenDialog =
  | { type: 'question'; index: number | null; value: Question }
  | { type: 'task'; index: number | null; value: PracticalTask | null };

const answerLetters = (question: Question) =>
  question.options
    .map((option, index) => (question.correctOptionIds.includes(option.id) ? index : -1))
    .filter((index) => index >= 0)
    .map((index) => String.fromCharCode(65 + index))
    .join(', ') || '–';

/** Step of the first error, so a failed save shows what to fix. */
function stepOf(errors: FieldErrors<ExamInput>): number {
  if (detailFields.some((field) => errors[field])) return 0;
  if (errors.questions) return 1;
  if (errors.tasks) return 2;
  return 0;
}

export function ExamForm({ defaultValues, isSaving, error, onSubmit }: ExamFormProps) {
  const form = useForm<ExamInput>({ resolver: zodResolver(examSchema), defaultValues });
  const { control, handleSubmit, trigger, formState } = form;
  // Items have their own `id`, which the default keyName ("id") would overwrite.
  const questions = useFieldArray({ control, name: 'questions', keyName: 'fieldKey' });
  const tasks = useFieldArray({ control, name: 'tasks', keyName: 'fieldKey' });
  const [step, setStep] = useState(0);
  const [dialog, setDialog] = useState<OpenDialog | null>(null);

  const listError =
    formState.errors.questions?.root?.message ?? formState.errors.questions?.message;
  const isLast = step === steps.length - 1;

  const goTo = async (next: number) => {
    // Details are checked before leaving the first step; everything again on save.
    if (step === 0 && next > 0 && !(await trigger([...detailFields]))) return;
    setStep(next);
  };

  const save = handleSubmit(onSubmit, (errors) => setStep(stepOf(errors)));

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={(event) => void save(event)}>
        <Stepper
          steps={steps}
          current={step}
          reachable={steps.length}
          onSelect={(index) => void goTo(index)}
        />
        <div className="space-y-4">
          {listError && <Alert>{listError}</Alert>}
          {Boolean(error) && <Alert>{getErrorMessage(error)}</Alert>}

          {step === 0 && <DetailsStep />}
          {step === 1 && (
            <ItemTable
              title="Part A – Multiple Choice Questions"
              itemName="Question"
              items={questions.fields}
              getKey={(item) => item.fieldKey}
              onAdd={() => setDialog({ type: 'question', index: null, value: createQuestion() })}
              onEdit={(_item, index) =>
                setDialog({ type: 'question', index, value: form.getValues(`questions.${index}`) })
              }
              onDelete={(_item, index) => questions.remove(index)}
              columns={[
                {
                  header: 'Question',
                  cell: (item) => (
                    <span className="block max-w-md truncate" title={item.text}>
                      {item.text}
                    </span>
                  ),
                },
                {
                  header: 'Type',
                  cell: (item) => (item.type === 'single' ? 'Single' : 'Multiple'),
                },
                { header: 'Options', cell: (item) => `${item.options.length} Options` },
                { header: 'Answer', align: 'center', cell: answerLetters },
              ]}
            />
          )}
          {step === 2 && (
            <ItemTable
              title="Part B – Practical Tasks"
              itemName="Task"
              items={tasks.fields}
              getKey={(item) => item.fieldKey}
              onAdd={() => setDialog({ type: 'task', index: null, value: null })}
              onEdit={(_item, index) =>
                setDialog({ type: 'task', index, value: form.getValues(`tasks.${index}`) })
              }
              onDelete={(_item, index) => tasks.remove(index)}
              columns={[
                { header: 'Application', cell: (item) => item.app },
                { header: 'Task', cell: (item) => item.title },
                {
                  header: 'Instructions',
                  cell: (item) => (
                    <span className="block max-w-sm truncate" title={item.instructions}>
                      {item.instructions}
                    </span>
                  ),
                },
              ]}
            />
          )}
          {isLast && <ReviewStep />}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-4">
          <Link to={path.adminExams} className={buttonClass('ghost')}>
            Cancel
          </Link>
          <div className="ml-auto flex flex-wrap gap-3">
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep(step - 1)}>
                <ArrowLeft aria-hidden className="size-4" />
                Previous
              </Button>
            )}
            <Button type="submit" variant={isLast ? 'primary' : 'secondary'} isLoading={isSaving}>
              <Save aria-hidden className="size-4" />
              Save exam
            </Button>
            {!isLast && (
              <Button onClick={() => void goTo(step + 1)}>
                Next
                <ArrowRight aria-hidden className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </form>

      {dialog?.type === 'question' && (
        <QuestionDialog
          question={dialog.value}
          isNew={dialog.index === null}
          onClose={() => setDialog(null)}
          onSave={(question) => {
            if (dialog.index === null) questions.append(question);
            else questions.update(dialog.index, question);
            setDialog(null);
          }}
        />
      )}
      {dialog?.type === 'task' && (
        <TaskDialog
          item={dialog.value}
          onClose={() => setDialog(null)}
          onSave={(values) => {
            if (dialog.index === null) tasks.append({ id: nanoid(), ...values });
            else tasks.update(dialog.index, { id: dialog.value?.id ?? '', ...values });
            setDialog(null);
          }}
        />
      )}
    </FormProvider>
  );
}
