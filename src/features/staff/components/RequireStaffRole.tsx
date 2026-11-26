import { Navigate, Outlet } from 'react-router-dom';
import { path } from '@/shared/config/paths';
import type { StaffRole } from '@/shared/types';
import { useStaffRole } from '../hooks';

/** UX only: sends a role away from screens of another role. The server must enforce roles. */
export function RequireStaffRole({ roles }: { roles: StaffRole[] }) {
  const role = useStaffRole();
  return roles.includes(role.id) ? <Outlet /> : <Navigate to={path.adminDashboard} replace />;
}
