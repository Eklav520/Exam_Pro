import { useState } from 'react';
import { EmptyState, PageError, PageHeader, PageLoader } from '@/shared/ui';
import { useGetExamsQuery } from '../api/examsApi';
import { ExamCard } from '../components/ExamCard';

export function ExamListPage() {
  const [search, setSearch] = useState('');
  const { data: exams, error, refetch } = useGetExamsQuery();

  const term = search.trim().toLowerCase();
  const visible = exams?.filter((exam) =>
    `${exam.title} ${exam.subject}`.toLowerCase().includes(term),
  );

  return (
    <>
      <PageHeader title="Exams" description="Choose an exam to see its rules and start." />
      <input
        type="search"
        aria-label="Search exams"
        placeholder="Search by title or subject"
        className="control mb-6 sm:max-w-sm"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      {error && <PageError error={error} onRetry={() => void refetch()} />}
      {!visible && !error && <PageLoader label="Loading exams…" />}
      {visible?.length === 0 && (
        <EmptyState title={term ? `No exams match “${search.trim()}”` : 'No exams available yet'} />
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible?.map((exam) => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
      </div>
    </>
  );
}
