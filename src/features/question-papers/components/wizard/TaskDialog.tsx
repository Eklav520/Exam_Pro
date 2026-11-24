import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, Field, Modal } from '@/shared/ui';
import { practicalApps, type PracticalItem } from '../../model/paper';

const schema = z.object({
  app: z.enum(practicalApps),
  title: z.string().trim().min(1, 'Enter the task title'),
  instructions: z.string().trim().min(1, 'Enter the instructions'),
  marks: z.number({ error: 'Enter the marks' }).positive('Marks must be more than 0'),
});

type FormValues = z.infer<typeof schema>;

interface TaskDialogProps {
  /** Null when adding. */
  item: PracticalItem | null;
  onSave: (item: Omit<PracticalItem, 'id'>) => void;
  onClose: () => void;
}

/** Mount while open, so every opening starts from fresh values. */
export function TaskDialog({ item, onSave, onClose }: TaskDialogProps) {
  const titleId = useId();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      app: item?.app ?? 'MS Word',
      title: item?.title ?? '',
      instructions: item?.instructions ?? '',
      marks: item?.marks ?? 20,
    },
  });

  return (
    <Modal open titleId={titleId} onClose={onClose} className="max-w-xl!">
      <h2 id={titleId} className="mb-4 text-lg font-bold">
        {item ? 'Edit Task' : 'Add Task'}
      </h2>
      <form noValidate className="space-y-4" onSubmit={handleSubmit((values) => onSave(values))}>
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <Field label="Application">
            {(props) => (
              <select {...props} {...register('app')}>
                {practicalApps.map((app) => (
                  <option key={app}>{app}</option>
                ))}
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
        <Field label="Task Title" required error={errors.title?.message}>
          {(props) => <input {...props} {...register('title')} />}
        </Field>
        <Field label="Instructions" required error={errors.instructions?.message}>
          {(props) => <textarea {...props} rows={5} {...register('instructions')} />}
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Task</Button>
        </div>
      </form>
    </Modal>
  );
}
