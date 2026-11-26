import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, Field, Modal } from '@/shared/ui';
import type { McqItem } from '../../model/paper';

const OPTION_COUNT = 4;

const schema = z.object({
  text: z.string().trim().min(1, 'Enter the question'),
  options: z
    .array(z.object({ text: z.string().trim().min(1, 'Enter this option') }))
    .length(OPTION_COUNT)
    .superRefine((options, context) => {
      const seen = new Set<string>();
      options.forEach((option, index) => {
        const text = option.text.toLowerCase();
        if (text && seen.has(text)) {
          context.addIssue({
            code: 'custom',
            path: [index, 'text'],
            message: 'This option is already used',
          });
        }
        seen.add(text);
      });
    }),
  correctIndex: z
    .string({ error: 'Choose the correct answer' })
    .min(1, 'Choose the correct answer')
    .transform(Number),
  marks: z.number({ error: 'Enter the marks' }).positive('Marks must be more than 0'),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

interface McqDialogProps {
  /** Null when adding. */
  item: McqItem | null;
  onSave: (item: Omit<McqItem, 'id'>) => void;
  onClose: () => void;
}

/** Mount while open, so every opening starts from fresh values. */
export function McqDialog({ item, onSave, onClose }: McqDialogProps) {
  const titleId = useId();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      text: item?.text ?? '',
      options: Array.from({ length: OPTION_COUNT }, (_value, index) => ({
        text: item?.options[index] ?? '',
      })),
      correctIndex: item ? String(item.correctIndex) : '',
      marks: item?.marks ?? 1,
    },
  });

  return (
    <Modal open titleId={titleId} onClose={onClose} className="max-w-3xl!">
      <h2 id={titleId} className="mb-4 text-lg font-bold">
        {item ? 'Edit Question' : 'Add Question'}
      </h2>
      <form
        noValidate
        className="space-y-4"
        onSubmit={handleSubmit((values) =>
          onSave({ ...values, options: values.options.map((option) => option.text) }),
        )}
      >
        <Field label="Question" required error={errors.text?.message}>
          {(props) => <textarea {...props} rows={2} {...register('text')} />}
        </Field>
        <fieldset className="space-y-2">
          <legend className="mb-1.5 text-sm font-medium">
            Options (select the correct answer)
          </legend>
          {Array.from({ length: OPTION_COUNT }, (_value, index) => {
            const letter = String.fromCharCode(65 + index);
            const error = errors.options?.[index]?.text?.message;
            return (
              <div key={letter}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    value={index}
                    aria-label={`${letter} is correct`}
                    className="size-4.5 accent-brand-700"
                    {...register('correctIndex')}
                  />
                  <span className="font-semibold">{letter}</span>
                  <input
                    aria-label={`Option ${letter}`}
                    aria-invalid={Boolean(error)}
                    className="control"
                    {...register(`options.${index}.text`)}
                  />
                </div>
                {error && <p className="mt-1 ml-14 text-sm text-danger">{error}</p>}
              </div>
            );
          })}
          {errors.correctIndex && (
            <p className="text-sm text-danger">{errors.correctIndex.message}</p>
          )}
        </fieldset>
        <div className="w-32">
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
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Question</Button>
        </div>
      </form>
    </Modal>
  );
}
