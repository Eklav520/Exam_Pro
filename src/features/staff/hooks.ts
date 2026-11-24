import { useAppSelector } from '@/app/hooks';
import { staffRoles } from './model/staffRoles';
import { selectStaffRole } from './model/staffSlice';

export function useStaffRole() {
  const id = useAppSelector(selectStaffRole);
  return { id, ...staffRoles[id] };
}
