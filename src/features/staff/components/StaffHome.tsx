import { Navigate } from 'react-router-dom';
import { useStaffRole } from '../hooks';

export function StaffHome() {
  return <Navigate to={useStaffRole().home} replace />;
}
