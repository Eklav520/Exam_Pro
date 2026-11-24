import {
  ArrowRight,
  Calendar,
  CircleCheck,
  CirclePlay,
  FileText,
  Flag,
  Hourglass,
  PencilLine,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStaffRole } from '@/features/staff';
import { path } from '@/shared/config/paths';
import { Card, PageHeader, StatCard, type StatTone } from '@/shared/ui';
import { StatusDonut } from '../components/StatusDonut';
import { WorkflowProgress } from '../components/WorkflowProgress';
import { academicYears, dashboardStats, examinationStatus, recentWorkflow } from '../data/sample';

const stats: {
  key: keyof typeof dashboardStats;
  label: string;
  icon: LucideIcon;
  tone: StatTone;
}[] = [
  { key: 'totalExaminations', label: 'Total Examinations', icon: Calendar, tone: 'blue' },
  { key: 'pendingApprovals', label: 'Pending Approvals', icon: Hourglass, tone: 'red' },
  { key: 'activeExaminations', label: 'Active Examinations', icon: CirclePlay, tone: 'teal' },
  { key: 'completed', label: 'Completed', icon: CircleCheck, tone: 'green' },
  { key: 'candidates', label: 'Candidates', icon: Users, tone: 'sky' },
  { key: 'submissions', label: 'Submissions', icon: FileText, tone: 'blue' },
  { key: 'pendingEvaluation', label: 'Pending Evaluation', icon: PencilLine, tone: 'amber' },
  {
    key: 'awaitingFinalApproval',
    label: 'Results Awaiting Final Approval',
    icon: Flag,
    tone: 'rose',
  },
];

export function AdminDashboardPage() {
  const role = useStaffRole();
  const [year, setYear] = useState(academicYears[0] ?? '');

  return (
    <>
      <PageHeader
        title={`Welcome, ${role.label}`}
        documentTitle="Dashboard"
        description="Manage examinations, approvals, evaluations and final results from a single platform."
        actions={
          <label className="flex items-center rounded-lg border border-line pl-3 text-sm">
            <span className="whitespace-nowrap text-muted">Academic Year:</span>
            <select
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="rounded-lg bg-transparent px-2 py-2.5 font-semibold"
            >
              {academicYears.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        }
      />
      <dl className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ key, ...stat }) => (
          <StatCard key={key} value={dashboardStats[key]} {...stat} />
        ))}
      </dl>
      <div className="grid gap-5 xl:grid-cols-[2fr_3fr]">
        <Card>
          <h2 className="mb-4 font-bold">Examination Status</h2>
          <StatusDonut items={examinationStatus} />
        </Card>
        <Card>
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold">Workflow Progress – Recent Exam</h2>
            <Link
              to={path.adminEvaluation}
              className="flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline"
            >
              View Details <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          <p className="mb-8 text-sm font-semibold">{recentWorkflow.examTitle}</p>
          <WorkflowProgress steps={recentWorkflow.steps} />
        </Card>
      </div>
    </>
  );
}
