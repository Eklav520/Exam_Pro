import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { path, to } from '@/shared/config/paths';
import { buttonClass, PageError, PageLoader } from '@/shared/ui';
import { useGetAttemptQuery } from '../api/attemptApi';
import { AttemptRunner } from '../components/AttemptRunner';
import { attemptLoaded, selectAttempt } from '../model/attemptSlice';

export function AttemptPage() {
  const { attemptId = '' } = useParams();
  const dispatch = useAppDispatch();
  const loadedId = useAppSelector(selectAttempt).attemptId;
  const { currentData: attempt, error, refetch } = useGetAttemptQuery(attemptId);

  useEffect(() => {
    // Keep local answers when they already belong to this attempt: they may be
    // newer than the server's copy.
    if (attempt?.status === 'in_progress' && attempt.id !== loadedId) {
      dispatch(attemptLoaded(attempt));
    }
  }, [attempt, loadedId, dispatch]);

  if (attempt?.status === 'submitted') {
    return <Navigate to={to.resultDetail(attempt.id)} replace />;
  }
  if (attempt && attempt.id === loadedId) return <AttemptRunner attempt={attempt} />;
  if (error) {
    return (
      <main className="mx-auto max-w-xl space-y-4 px-4 py-16">
        <PageError error={error} onRetry={() => void refetch()} />
        <Link to={path.exams} className={buttonClass('secondary')}>
          Back to exams
        </Link>
      </main>
    );
  }
  return <PageLoader label="Preparing your exam…" />;
}
