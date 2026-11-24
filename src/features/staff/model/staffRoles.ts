import { path } from '@/shared/config/paths';
import type { StaffRole } from '@/shared/types';

interface StaffRoleConfig {
  label: string;
  initials: string;
  /** Screen shown after signing in. */
  home: string;
  /** Where the "Evaluation" menu item leads; null hides it. */
  evaluation: string | null;
}

export const staffRoles: Record<StaffRole, StaffRoleConfig> = {
  admin: {
    label: 'Admin',
    initials: 'AD',
    home: path.adminDashboard,
    evaluation: path.adminAllocation,
  },
  question_paper_setter: {
    label: 'Question Paper Setter',
    initials: 'QP',
    home: path.adminQuestionPapers,
    evaluation: null,
  },
  higher_official: {
    label: 'Higher Official',
    initials: 'HO',
    home: path.adminApprovals,
    evaluation: path.adminFinalApproval,
  },
  evaluator: {
    label: 'Evaluator',
    initials: 'EP',
    home: path.adminWorkspace,
    evaluation: path.adminWorkspace,
  },
};
