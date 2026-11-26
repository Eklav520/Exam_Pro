import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useId } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import type { Question } from '@/shared/types';
import { Button, Field, IconButton, Modal } from '@/shared/ui';
import { createOption, MAX_OPTIONS, MIN_OPTIONS, questionSchema } from '../model/examSchema';

interface QuestionDialogProps {
  question: Question;
  isNew: boolean;
  onSave: (question: Question) => void;
  onClose: () => void;
}

/** Mount while open, so every opening starts from fresh values. */
export function QuestionDialog({ question, isNew, onSave, onClose }: QuestionDialogProps) {
  const titleId = useId();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitted },
  } = useForm<Question>({ resolver: zodResolver(questionSchema), defaultValues: question });
  // Options have their own `id`, which the default keyName ("id") would overwrite.
  const options = useFieldArray({ control, name: 'options', keyName: 'fieldKey' });
  const type = useWatch({ control, name: 'type' });
  const correct = useWatch({ control, name: 'correctOptionIds' });
  const answerError =
    errors.correctOptionIds?.message ?? errors.options?.root?.message ?? errors.options?.message;

  const setCorrect = (ids: string[]) =>
    setValue('correctOptionIds', ids, { shouldValidate: isSubmitted });

  const toggleCorrect = (id: string) => {
    if (type === 'single') setCorrect([id]);
    else
      setCorrect(correct.includes(id) ? correct.filter((item) => item !== id) : [...correct, id]);
  };

  return (
    // Wide and in two columns, so the whole question fits on screen without scrolling.
    <Modal open titleId={titleId} onClose={onClose} className="max-w-5xl!">
      <h2 id={titleId} className="mb-4 text-lg font-bold">
        {isNew ? 'Add Question' : 'Edit Question'}
      </h2>
      <form noValidate className="space-y-5" onSubmit={handleSubmit(onSave)}>
        <div className="grid gap-4 md:grid-cols-[1fr_14rem]">
          <Field label="Question" required error={errors.text?.message}>
            {(props) => <textarea {...props} rows={4} {...register('text')} />}
          </Field>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-1 md:content-start">
            <Field label="Answer type">
              {(props) => (
                <select
                  {...props}
                  {...register('type', {
                    onChange: (event: { target: { value: string } }) => {
                      if (event.target.value === 'single') setCorrect(correct.slice(0, 1));
                    },
                  })}
                >
                  <option value="single">Single answer</option>
                  <option value="multiple">Multiple answers</option>
                </select>
              )}
            </Field>
            <Field label="Marks" required error={errors.marks?.message}>
              {(props) => (
                <input
                  {...props}
                  type="number"
                  step="any"
                  {...register('marks', { valueAsNumber: true })}
                />
              )}
            </Field>
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">
            Options (
            {type === 'single' ? 'select the correct answer' : 'select every correct answer'})
          </legend>
          <div className="grid gap-x-6 gap-y-3 md:grid-cols-2">
            {options.fields.map((option, index) => {
              const letter = String.fromCharCode(65 + index);
              const error = errors.options?.[index]?.text?.message;
              return (
                <div key={option.fieldKey}>
                  <div className="flex items-center gap-3">
                    <input
                      type={type === 'single' ? 'radio' : 'checkbox'}
                      aria-label={`${letter} is correct`}
                      checked={correct.includes(option.id)}
                      onChange={() => toggleCorrect(option.id)}
                      className="size-4.5 shrink-0 accent-brand-700"
                    />
                    <span className="w-4 shrink-0 font-semibold">{letter}</span>
                    <input
                      aria-label={`Option ${letter}`}
                      aria-invalid={Boolean(error)}
                      className="control"
                      {...register(`options.${index}.text`)}
                    />
                    <IconButton
                      icon={Trash2}
                      label={`Remove option ${letter}`}
                      disabled={options.fields.length <= MIN_OPTIONS}
                      onClick={() => {
                        options.remove(index);
                        setCorrect(getValues('correctOptionIds').filter((id) => id !== option.id));
                      }}
                    />
                  </div>
                  {error && <p className="mt-1 ml-14 text-sm text-danger">{error}</p>}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              disabled={options.fields.length >= MAX_OPTIONS}
              onClick={() => options.append(createOption())}
            >
              <Plus aria-hidden className="size-4" />
              Add option
            </Button>
            {answerError && <p className="text-sm text-danger">{answerError}</p>}
          </div>
        </fieldset>

        <Field label="Explanation" hint="Shown to students with their result.">
          {(props) => <textarea {...props} rows={2} {...register('explanation')} />}
        </Field>
        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Question</Button>
        </div>
      </form>
    </Modal>
  );
}
