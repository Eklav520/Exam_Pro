import {
  ArrowRight,
  Calendar,
  CalendarDays,
  CircleCheck,
  CirclePlay,
  FileText,
  Flag,
  Hourglass,
  MonitorCheck,
  PencilLine,
  UserCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { submissionStats } from '@/features/evaluation';
import { path } from '@/shared/config/paths';
import { Card, StatCard, type StatTone } from '@/shared/ui';
import { academicYears, dashboardStats, examinationStatus, recentWorkflow } from '../data/sample';
import { DashboardHeader } from './DashboardHeader';
import { StatusDonut } from './StatusDonut';
import { TaskList, type Task } from './TaskList';
import { WorkflowProgress } from './WorkflowProgress';

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

const unallocated = submissionStats.total - submissionStats.allocated;

const tasks: Task[] = [
  {
    id: 'setup',
    icon: CalendarDays,
    title: 'Finish setting up draft examinations',
    detail: `${examinationStatus.find((item) => item.label === 'Draft')?.count ?? 0} examination in draft. Set its pattern so paper setters can start.`,
    to: path.adminExams,
    action: 'Exam Setup',
  },
  {
    id: 'monitor',
    icon: MonitorCheck,
    title: 'Monitor examinations in progress',
    detail: `${dashboardStats.activeExaminations} examinations are running across the centres.`,
    to: path.adminMonitoring,
    action: 'Monitor',
  },
  {
    id: 'allocate',
    icon: UserCheck,
    title: 'Assign answer papers to evaluators',
    detail: `${unallocated.toLocaleString('en-IN')} submitted answer papers are not assigned yet.`,
    to: path.adminAllocation,
    action: 'Allocate',
  },
];

export function AdminDashboard() {
  const [year, setYear] = useState(academicYears[0] ?? '');

  return (
    <>
      <DashboardHeader
        description="Set up examinations, run them at the centres, assign evaluators and manage users."
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
      <div className="mb-5 grid gap-5 xl:grid-cols-[3fr_2fr]">
        <TaskList tasks={tasks} />
        <Card>
          <h2 className="mb-4 font-bold">Examination Status</h2>
          <StatusDonut items={examinationStatus} />
        </Card>
      </div>
      <Card>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">Workflow Progress – Recent Exam</h2>
          <Link
            to={path.adminAllocation}
            className="flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline"
          >
            View Details <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
        <p className="mb-8 text-sm font-semibold">{recentWorkflow.examTitle}</p>
        <WorkflowProgress steps={recentWorkflow.steps} />
      </Card>
    </>
  );
}
