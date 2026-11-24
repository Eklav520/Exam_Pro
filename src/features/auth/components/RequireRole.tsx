import { Navigate, Outlet } from 'react-router-dom';
import { path } from '@/shared/config/paths';
import type { UserRole } from '@/shared/types';
import { useCurrentUser } from '../hooks';

/** UX only. The server must enforce roles on every request. */
export function RequireRole({ role }: { role: UserRole }) {
  const user = useCurrentUser();
  return user?.role === role ? <Outlet /> : <Navigate to={path.home} replace />;
}
