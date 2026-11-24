import { ClipboardCheck, SquarePen, UserCog, UsersRound, type LucideIcon } from 'lucide-react';
import type { StaffRole } from '@/shared/types';

export type RoleId = StaffRole;
export const roleIds = [
  'admin',
  'question_paper_setter',
  'higher_official',
  'evaluator',
] as const satisfies RoleId[];

interface RoleConfig {
  label: string;
  icon: LucideIcon;
  /** Summary card, icon, and badge / avatar colours. */
  card: string;
  iconColor: string;
  badge: string;
}

export const roles: Record<RoleId, RoleConfig> = {
  admin: {
    label: 'Admin',
    icon: UserCog,
    card: 'border-blue-200 bg-[#dcecfe]',
    iconColor: 'text-blue-700',
    badge: 'bg-[#dcecfe] text-blue-900',
  },
  question_paper_setter: {
    label: 'Question Paper Setter',
    icon: SquarePen,
    card: 'border-violet-200 bg-[#ecebfd]',
    iconColor: 'text-violet-700',
    badge: 'bg-[#ece5fe] text-violet-900',
  },
  higher_official: {
    label: 'Higher Official',
    icon: UsersRound,
    card: 'border-green-200 bg-[#ddf9e9]',
    iconColor: 'text-green-700',
    badge: 'bg-[#d9f9e5] text-green-900',
  },
  evaluator: {
    label: 'Evaluator',
    icon: ClipboardCheck,
    card: 'border-orange-200 bg-[#feeee6]',
    iconColor: 'text-orange-600',
    badge: 'bg-[#feebda] text-orange-900',
  },
};
