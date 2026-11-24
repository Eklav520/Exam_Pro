import { useNavigate, useParams } from 'react-router-dom';
import { useStartAttemptMutation } from '@/features/attempt';
import { getErrorMessage } from '@/shared/api/getErrorMessage';
import { to } from '@/shared/config/paths';
import { formatDuration, formatNumber } from '@/shared/lib/format';
import { Alert, Button, Card, PageError, PageHeader, PageLoader } from '@/shared/ui';
import { useGetExamQuery } from '../api/examsApi';

export function ExamDetailPage() {
  const { examId = '' } = useParams();
  const navigate = useNavigate();
  const { data: exam, error, refetch } = useGetExamQuery(examId);
  const [startAttempt, start] = useStartAttemptMutation();

  if (error) return <PageError error={error} onRetry={() => void refetch()} />;
  if (!exam) return <PageLoader label="Loading exam…" />;

  const handleStart = async () => {
    const result = await startAttempt(exam.id);
    if (result.data) await navigate(to.attempt(result.data.id));
  };

  const facts = [
    ['Questions', String(exam.questionCount)],
    ['Duration', formatDuration(exam.durationMinutes)],
    ['Total marks', formatNumber(exam.totalMarks)],
    ['Pass mark', `${exam.passPercentage}%`],
  ] as const;

  return (
    <>
      <PageHeader title={exam.title} description={exam.description} />
      <Card>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="text-lg font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <h2 className="mt-6 mb-2 font-semibold">Before you start</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          <li>The timer starts immediately and keeps running if you close the page.</li>
          <li>Answers save automatically. You can move between questions in any order.</li>
          <li>The exam is submitted for you when time runs out.</li>
          <li>
            {exam.negativeMarking > 0
              ? `A wrong answer deducts ${formatNumber(exam.negativeMarking * 100)}% of that question’s marks.`
              : 'There is no negative marking.'}
          </li>
        </ul>
        {start.error && (
          <div className="mt-4">
            <Alert>{getErrorMessage(start.error)}</Alert>
          </div>
        )}
        <Button
          className="mt-6"
          isLoading={start.isLoading}
          onClick={() => {
            void handleStart();
          }}
        >
          {exam.activeAttemptId ? 'Resume exam' : 'Start exam'}
        </Button>
      </Card>
    </>
  );
}
