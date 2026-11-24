import { Link } from 'react-router-dom';
import { useCurrentUser } from '@/features/auth';
import { ExamCard, useGetExamsQuery } from '@/features/exams';
import { ResultTable, useGetResultsQuery } from '@/features/results';
import { path } from '@/shared/config/paths';
import { formatNumber } from '@/shared/lib/format';
import { Card, EmptyState, PageError, PageHeader, PageLoader } from '@/shared/ui';

const PREVIEW_COUNT = 3;

export function DashboardPage() {
  const user = useCurrentUser();
  const exams = useGetExamsQuery();
  const results = useGetResultsQuery();

  const error = exams.error ?? results.error;
  if (error) {
    const retry = () => {
      void exams.refetch();
      void results.refetch();
    };
    return <PageError error={error} onRetry={retry} />;
  }
  if (!exams.data || !results.data) return <PageLoader label="Loading dashboard…" />;

  const taken = results.data.length;
  const average = results.data.reduce((sum, result) => sum + result.percentage, 0) / taken;
  const passed = results.data.filter((result) => result.passed).length;
  const stats = [
    ['Exams available', String(exams.data.length)],
    ['Exams taken', String(taken)],
    ['Average score', taken ? `${formatNumber(average)}%` : '–'],
    ['Passed', taken ? `${passed} of ${taken}` : '–'],
  ] as const;

  // Unfinished exams are on the clock, so they come first.
  const upcoming = [...exams.data].sort(
    (a, b) => Number(b.activeAttemptId !== null) - Number(a.activeAttemptId !== null),
  );

  return (
    <>
      <PageHeader title={`Welcome, ${user?.name.split(' ')[0] ?? ''}`} />
      <dl className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <Card key={label}>
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
          </Card>
        ))}
      </dl>

      <SectionHeading title="Exams" link={path.exams} />
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {upcoming.slice(0, PREVIEW_COUNT).map((exam) => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
      </div>

      <SectionHeading title="Recent results" link={path.results} />
      {taken === 0 ? (
        <EmptyState title="No results yet">Your results appear here after an exam.</EmptyState>
      ) : (
        <ResultTable results={results.data.slice(0, PREVIEW_COUNT)} />
      )}
    </>
  );
}

function SectionHeading({ title, link }: { title: string; link: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Link to={link} className="text-sm font-medium text-brand-700 hover:underline">
        View all
      </Link>
    </div>
  );
}
