import { useCurrentUser } from '@/features/auth';
import { staffRoles } from './model/staffRoles';

export function useStaffRole() {
  // The backend has a single "admin" role for now; treat it as the Main Admin.
  const id = useCurrentUser()?.staffRole ?? 'main_admin';
  return { id, ...staffRoles[id] };
}
