import { Navigate } from 'react-router-dom';
import { path } from '@/shared/config/paths';
import { useCurrentUser } from '../hooks';

export function RoleHome() {
  const user = useCurrentUser();
  return <Navigate to={user?.role === 'admin' ? path.admin : path.candidateLaunch} replace />;
}
