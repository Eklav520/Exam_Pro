import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import type { ExamInput } from '@/shared/types';
import { Button, Card, Field } from '@/shared/ui';
import { createOption } from '../model/examSchema';

interface QuestionEditorProps {
  index: number;
  onRemove: () => void;
}

export function QuestionEditor({ index, onRemove }: QuestionEditorProps) {
  const {
    register,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitted },
  } = useFormContext<ExamInput>();
  const name = `questions.${index}` as const;
  const options = useFieldArray({ control, name: `${name}.options`, keyName: 'fieldKey' });
  const type = useWatch({ control, name: `${name}.type` });
  const correctOptionIds = useWatch({ control, name: `${name}.correctOptionIds` });
  const questionErrors = errors.questions?.[index];
  const answerError =
    questionErrors?.correctOptionIds?.message ??
    questionErrors?.options?.root?.message ??
    questionErrors?.options?.message;

  const setCorrect = (ids: string[]) =>
    setValue(`${name}.correctOptionIds`, ids, { shouldDirty: true, shouldValidate: isSubmitted });

  const toggleCorrect = (optionId: string) => {
    if (type === 'single') setCorrect([optionId]);
    else if (correctOptionIds.includes(optionId))
      setCorrect(correctOptionIds.filter((id) => id !== optionId));
    else setCorrect([...correctOptionIds, optionId]);
  };

  const removeOption = (optionIndex: number, optionId: string) => {
    options.remove(optionIndex);
    setCorrect(getValues(`${name}.correctOptionIds`).filter((id) => id !== optionId));
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Question {index + 1}</h3>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Remove question ${index + 1}`}
          onClick={onRemove}
        >
          Remove
        </Button>
      </div>
      <Field label="Question text" error={questionErrors?.text?.message}>
        {(props) => <textarea {...props} rows={2} {...register(`${name}.text`)} />}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type">
          {(props) => (
            <select
              {...props}
              {...register(`${name}.type`, {
                onChange: (event: { target: { value: string } }) => {
                  if (event.target.value === 'single') setCorrect(correctOptionIds.slice(0, 1));
                },
              })}
            >
              <option value="single">Single answer</option>
              <option value="multiple">Multiple answers</option>
            </select>
          )}
        </Field>
        <Field label="Marks" error={questionErrors?.marks?.message}>
          {(props) => (
            <input
              {...props}
              type="number"
              step="any"
              {...register(`${name}.marks`, { valueAsNumber: true })}
            />
          )}
        </Field>
      </div>
      <fieldset className="space-y-2">
        <legend className="mb-1.5 text-sm font-medium">Options (select what’s correct)</legend>
        {options.fields.map((option, optionIndex) => {
          const optionError = questionErrors?.options?.[optionIndex]?.text?.message;
          return (
            <div key={option.fieldKey}>
              <div className="flex items-center gap-3">
                <input
                  type={type === 'single' ? 'radio' : 'checkbox'}
                  aria-label={`Option ${optionIndex + 1} is correct`}
                  checked={correctOptionIds.includes(option.id)}
                  onChange={() => toggleCorrect(option.id)}
                  className="accent-brand-700"
                />
                <input
                  aria-label={`Option ${optionIndex + 1}`}
                  aria-invalid={Boolean(optionError)}
                  className="control"
                  {...register(`${name}.options.${optionIndex}.text`)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Remove option ${optionIndex + 1}`}
                  disabled={options.fields.length <= 2}
                  onClick={() => removeOption(optionIndex, option.id)}
                >
                  Remove
                </Button>
              </div>
              {optionError && <p className="mt-1 ml-7 text-sm text-danger">{optionError}</p>}
            </div>
          );
        })}
        {answerError && <p className="text-sm text-danger">{answerError}</p>}
        <Button variant="secondary" size="sm" onClick={() => options.append(createOption())}>
          Add option
        </Button>
      </fieldset>
      <Field label="Explanation" hint="Shown to students after they submit.">
        {(props) => <textarea {...props} rows={2} {...register(`${name}.explanation`)} />}
      </Field>
    </Card>
  );
}
