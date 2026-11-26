import {
  CalendarDays,
  ChartColumn,
  ClipboardCheck,
  FileCheck2,
  FileText,
  House,
  MonitorCheck,
  Server,
  Settings,
  SquarePen,
  UserCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { path } from '@/shared/config/paths';
import type { StaffRole } from '@/shared/types';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface StaffRoleConfig {
  label: string;
  initials: string;
  /** Screen shown after signing in. */
  home: string;
  /** Where the "Evaluation" link leads; null when the role has no evaluation work. */
  evaluation: string | null;
  /** Sidebar, in order. Each role only sees its own part of the workflow. */
  nav: NavItem[];
}

const dashboard: NavItem = { to: path.adminDashboard, label: 'Dashboard', icon: House };

export const staffRoles: Record<StaffRole, StaffRoleConfig> = {
  admin: {
    label: 'Admin',
    initials: 'AD',
    home: path.adminDashboard,
    evaluation: path.adminAllocation,
    nav: [
      dashboard,
      { to: path.adminExams, label: 'Exam Setup', icon: CalendarDays },
      { to: path.adminMonitoring, label: 'Exam Monitoring', icon: MonitorCheck },
      { to: path.adminCentres, label: 'Centres & Systems', icon: Server },
      { to: path.adminAllocation, label: 'Evaluator Allocation', icon: UserCheck },
      { to: path.adminUsers, label: 'Users & Roles', icon: Users },
      { to: path.adminReports, label: 'Reports', icon: ChartColumn },
      { to: path.adminSettings, label: 'Settings', icon: Settings },
    ],
  },
  question_paper_setter: {
    label: 'Question Paper Setter',
    initials: 'QP',
    home: path.adminDashboard,
    evaluation: null,
    nav: [dashboard, { to: path.adminQuestionPapers, label: 'My Paper Sets', icon: FileText }],
  },
  higher_official: {
    label: 'Higher Official',
    initials: 'HO',
    home: path.adminDashboard,
    evaluation: path.adminFinalApproval,
    nav: [
      dashboard,
      { to: path.adminApprovals, label: 'Paper Approval', icon: ClipboardCheck },
      { to: path.adminFinalApproval, label: 'Result Release', icon: FileCheck2 },
    ],
  },
  evaluator: {
    label: 'Evaluator',
    initials: 'EV',
    home: path.adminDashboard,
    evaluation: path.adminAssignedPapers,
    nav: [dashboard, { to: path.adminAssignedPapers, label: 'Assigned Papers', icon: SquarePen }],
  },
};
