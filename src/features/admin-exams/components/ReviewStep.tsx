import { useFormContext, useWatch } from 'react-hook-form';
import type { ExamInput } from '@/shared/types';
import { Badge, Card } from '@/shared/ui';

const sum = (items: { marks: number }[]) =>
  items.reduce((total, item) => total + (Number.isFinite(item.marks) ? item.marks : 0), 0);

export function ReviewStep() {
  const { control } = useFormContext<ExamInput>();
  const exam = useWatch({ control }) as ExamInput;
  const questionMarks = sum(exam.questions);
  const taskMarks = sum(exam.tasks);

  const facts = [
    ['Title', exam.title || '–'],
    ['Subject', exam.subject || '–'],
    ['Duration', `${exam.durationMinutes} minutes`],
    ['Pass mark', `${exam.passPercentage}%`],
    ['Negative marking', exam.negativeMarking ? `${exam.negativeMarking * 100}% of marks` : 'None'],
    ['Part A – MCQ', `${exam.questions.length} questions, ${questionMarks} marks`],
    ['Part B – Practical', `${exam.tasks.length} tasks, ${taskMarks} marks`],
    [
      'Total',
      `${exam.questions.length + exam.tasks.length} items, ${questionMarks + taskMarks} marks`,
    ],
  ] as const;

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-bold">Review</h2>
        <Badge tone={exam.status === 'published' ? 'success' : 'neutral'}>
          {exam.status === 'published' ? 'Will be published' : 'Will be saved as draft'}
        </Badge>
      </div>
      <dl className="divide-y divide-line">
        {facts.map(([label, value]) => (
          <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[12rem_1fr]">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
