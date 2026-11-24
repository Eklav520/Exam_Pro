import { EmptyState, PageError, PageHeader, PageLoader } from '@/shared/ui';
import { useGetResultsQuery } from '../api/resultsApi';
import { ResultTable } from '../components/ResultTable';

export function ResultListPage() {
  const { data: results, error, refetch } = useGetResultsQuery();
  return (
    <>
      <PageHeader title="Results" description="Every exam you have submitted." />
      {error && <PageError error={error} onRetry={() => void refetch()} />}
      {!results && !error && <PageLoader label="Loading results…" />}
      {results?.length === 0 && (
        <EmptyState title="No results yet">Submit an exam and its result appears here.</EmptyState>
      )}
      {results && results.length > 0 && <ResultTable results={results} />}
    </>
  );
}
