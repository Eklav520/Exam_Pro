import { useStaffRole } from '@/features/staff';
import { AdminDashboard } from '../components/AdminDashboard';
import { EvaluatorDashboard } from '../components/EvaluatorDashboard';
import { OfficialDashboard } from '../components/OfficialDashboard';
import { SetterDashboard } from '../components/SetterDashboard';

/** Each role has its own dashboard with its own work. */
export function AdminDashboardPage() {
  switch (useStaffRole().id) {
    case 'question_paper_setter':
      return <SetterDashboard />;
    case 'higher_official':
      return <OfficialDashboard />;
    case 'evaluator':
      return <EvaluatorDashboard />;
    default:
      return <AdminDashboard />;
  }
}
