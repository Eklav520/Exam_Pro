import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { path } from '@/shared/config/paths';
import { PageError, PageLoader } from '@/shared/ui';
import { useGetMeQuery } from '../api/authApi';
import { selectHasLoggedOut, selectIsAuthenticated } from '../model/authSlice';

export function RequireAuth() {
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const hasLoggedOut = useAppSelector(selectHasLoggedOut);
  const { data: user, error, refetch } = useGetMeQuery(undefined, { skip: !isAuthenticated });

  if (!isAuthenticated) {
    return (
      <Navigate to={path.login} replace state={hasLoggedOut ? null : { from: location.pathname }} />
    );
  }
  if (user) return <Outlet />;
  if (error) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <PageError error={error} onRetry={() => void refetch()} />
      </main>
    );
  }
  return <PageLoader label="Signing you in…" />;
}
