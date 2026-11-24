import { Link } from 'react-router-dom';
import { to } from '@/shared/config/paths';
import { formatDuration } from '@/shared/lib/format';
import type { StudentExam } from '@/shared/types';
import { Badge, buttonClass, Card } from '@/shared/ui';

export function ExamCard({ exam }: { exam: StudentExam }) {
  const inProgress = exam.activeAttemptId !== null;
  return (
    <Card className="flex flex-col">
      <div className="mb-2 flex items-center gap-2">
        <Badge tone="brand">{exam.subject}</Badge>
        {inProgress && <Badge tone="warning">In progress</Badge>}
      </div>
      <h3 className="font-semibold">{exam.title}</h3>
      <p className="mt-1 flex-1 text-sm text-muted">{exam.description}</p>
      <p className="mt-4 text-sm text-muted">
        {exam.questionCount} questions · {formatDuration(exam.durationMinutes)} · {exam.totalMarks}{' '}
        marks
      </p>
      <Link
        to={to.examDetail(exam.id)}
        aria-label={`${inProgress ? 'Continue' : 'View'} ${exam.title}`}
        className={buttonClass(inProgress ? 'primary' : 'secondary') + ' mt-4'}
      >
        {inProgress ? 'Continue' : 'View exam'}
      </Link>
    </Card>
  );
}
