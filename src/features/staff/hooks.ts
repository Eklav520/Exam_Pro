import { useCurrentUser } from '@/features/auth';
import { staffRoles } from './model/staffRoles';

export function useStaffRole() {
  // The backend does not send a staff role yet.
  const id = useCurrentUser()?.staffRole ?? 'admin';
  return { id, ...staffRoles[id] };
}
