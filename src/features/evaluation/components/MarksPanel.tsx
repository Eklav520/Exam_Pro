import { Field } from '@/shared/ui';
import type { PracticalTask, TaskMark } from '../data/sample';

interface MarksPanelProps {
  task: PracticalTask;
  value: TaskMark;
  error: string | undefined;
  onChange: (value: TaskMark) => void;
}

export function MarksPanel({ task, value, error, onChange }: MarksPanelProps) {
  return (
    <section className="space-y-4 rounded-xl border border-line p-4">
      <h2 className="font-bold">Marks ({task.maxMarks})</h2>
      <Field label="Awarded Marks" required error={error}>
        {(props) => (
          <input
            {...props}
            type="number"
            min={0}
            max={task.maxMarks}
            step="any"
            value={value.marks}
            onChange={(event) => onChange({ ...value, marks: event.target.value })}
          />
        )}
      </Field>
      <Field label="Remarks">
        {(props) => (
          <textarea
            {...props}
            rows={6}
            value={value.remarks}
            onChange={(event) => onChange({ ...value, remarks: event.target.value })}
          />
        )}
      </Field>
    </section>
  );
}
