import { Navigate } from 'react-router-dom';
import { useStaffRole } from '../hooks';

/** "Evaluation" means a different screen for each role. */
export function EvaluationHome() {
  const role = useStaffRole();
  return <Navigate to={role.evaluation ?? role.home} replace />;
}
