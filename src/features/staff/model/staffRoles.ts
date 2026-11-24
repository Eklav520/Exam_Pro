import { path } from '@/shared/config/paths';
import type { StaffRole } from '@/shared/types';

interface StaffRoleConfig {
  label: string;
  initials: string;
  /** Screen shown after signing in. */
  home: string;
  /** Where the "Evaluation" menu item leads. */
  evaluation: string;
}

export const staffRoles: Record<StaffRole, StaffRoleConfig> = {
  main_admin: {
    label: 'Main Admin',
    initials: 'MA',
    home: path.adminDashboard,
    evaluation: path.adminFinalApproval,
  },
  admin: {
    label: 'Admin',
    initials: 'AD',
    home: path.adminQuestionPapers,
    evaluation: path.adminAllocation,
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
