import { Link, useParams } from 'react-router-dom';
import { to } from '@/shared/config/paths';
import { formatDateTime, formatNumber } from '@/shared/lib/format';
import { Badge, buttonClass, Card, PageError, PageHeader, PageLoader } from '@/shared/ui';
import { useGetResultQuery } from '../api/resultsApi';
import { QuestionReviewCard } from '../components/QuestionReviewCard';

export function ResultDetailPage() {
  const { attemptId = '' } = useParams();
  const { data: result, error, refetch } = useGetResultQuery(attemptId);

  if (error) return <PageError error={error} onRetry={() => void refetch()} />;
  if (!result) return <PageLoader label="Loading result…" />;

  return (
    <>
      <PageHeader
        title={result.examTitle}
        description={`Submitted ${formatDateTime(result.submittedAt)}`}
        actions={
          <Link to={to.examDetail(result.examId)} className={buttonClass('secondary')}>
            Back to exam
          </Link>
        }
      />
      <Card className="mb-8 flex flex-wrap items-center gap-x-10 gap-y-4">
        <div>
          <p className="text-4xl font-semibold tabular-nums">{formatNumber(result.percentage)}%</p>
          <p className="mt-1 text-sm text-muted">
            {formatNumber(result.score)} of {formatNumber(result.totalMarks)} marks · pass mark{' '}
            {result.passPercentage}%
          </p>
        </div>
        <Badge tone={result.passed ? 'success' : 'danger'}>
          {result.passed ? 'Passed' : 'Not passed'}
        </Badge>
        <dl className="flex gap-6 text-sm">
          {(
            [
              ['Correct', result.correct],
              ['Incorrect', result.incorrect],
              ['Not answered', result.unanswered],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <dt className="text-muted">{label}</dt>
              <dd className="text-lg font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <h2 className="mb-4 text-lg font-semibold">Answer review</h2>
      <div className="space-y-4">
        {result.review.map((review, index) => (
          <QuestionReviewCard key={review.question.id} number={index + 1} review={review} />
        ))}
      </div>
    </>
  );
}
