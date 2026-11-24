import { Navigate } from 'react-router-dom';
import { useStaffRole } from '../hooks';

/** "Evaluation" means a different screen for each role. */
export function EvaluationHome() {
  return <Navigate to={useStaffRole().evaluation} replace />;
}
