import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { useState } from 'react';
import { FormProvider, useForm, type FieldErrors } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '@/shared/api/getErrorMessage';
import { path } from '@/shared/config/paths';
import { Alert, Button, buttonClass, Stepper } from '@/shared/ui';
import { detailFields, examSchema, type ExamFormValues } from '../model/examSchema';
import { DetailsStep } from './DetailsStep';
import { ReviewStep } from './ReviewStep';
import { SectionsStep } from './SectionsStep';

const steps = ['Exam Details', 'Sections & Pattern', 'Review'] as const;

interface ExamFormProps {
  defaultValues: ExamFormValues;
  isSaving: boolean;
  error: unknown;
  onSubmit: (input: ExamFormValues) => void;
}

/** Step of the first error, so a failed save shows what to fix. */
function stepOf(errors: FieldErrors<ExamFormValues>): number {
  if (detailFields.some((field) => errors[field])) return 0;
  if (errors.sections) return 1;
  return 0;
}

/**
 * The Admin sets up the exam and its pattern. Questions are written by paper setters,
 * so any the exam already has are kept as they are.
 */
export function ExamForm({ defaultValues, isSaving, error, onSubmit }: ExamFormProps) {
  const form = useForm<ExamFormValues>({ resolver: zodResolver(examSchema), defaultValues });
  const { handleSubmit, trigger, formState } = form;
  const [step, setStep] = useState(0);

  const listError = formState.errors.sections?.root?.message ?? formState.errors.sections?.message;
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
          {step === 1 && <SectionsStep />}
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
    </FormProvider>
  );
}
