import clsx from 'clsx';
import {
  CalendarDays,
  ChartColumn,
  ClipboardCheck,
  FileCheck2,
  FileText,
  House,
  MonitorCheck,
  Settings,
  SquarePen,
  Users,
} from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useStaffRole } from '@/features/staff';
import { path } from '@/shared/config/paths';
import { Brand } from '@/shared/ui';

const items = [
  { to: path.adminDashboard, label: 'Dashboard', icon: House },
  { to: path.adminExams, label: 'Examinations', icon: CalendarDays },
  { to: path.adminQuestionPapers, label: 'Question Papers', icon: FileText },
  { to: path.adminApprovals, label: 'Approvals', icon: ClipboardCheck },
  { to: path.adminMonitoring, label: 'Conduct & Monitoring', icon: MonitorCheck },
  { to: path.adminEvaluation, label: 'Evaluation', icon: SquarePen },
  { to: path.adminResults, label: 'Results', icon: FileCheck2 },
  { to: path.adminUsers, label: 'Users & Roles', icon: Users },
  { to: path.adminReports, label: 'Reports', icon: ChartColumn },
  { to: path.adminSettings, label: 'Settings', icon: Settings },
];

interface SidebarProps {
  /** Only matters on small screens, where the sidebar is a drawer. */
  isOpen: boolean;
  onNavigate: () => void;
}

export function Sidebar({ isOpen, onNavigate }: SidebarProps) {
  const { evaluation } = useStaffRole();
  const visible = items.filter((item) => item.to !== path.adminEvaluation || evaluation !== null);

  return (
    <aside
      id="admin-sidebar"
      className={clsx(
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto bg-linear-to-b from-navy-800 to-navy-900 text-white',
        'transition-[translate,visibility] lg:visible lg:translate-x-0',
        isOpen ? 'visible translate-x-0' : 'invisible -translate-x-full',
      )}
    >
      <div className="px-5 pt-6 pb-5">
        <Link to={path.admin} onClick={onNavigate} className="block rounded-lg">
          <Brand />
        </Link>
      </div>
      <nav aria-label="Main" className="space-y-1 px-3 pb-6">
        {visible.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-4 rounded-lg px-4 py-2.5 text-[0.9375rem]',
                isActive
                  ? 'bg-linear-to-r from-brand-700 to-brand-800 font-semibold'
                  : 'text-white/85 hover:bg-white/10 hover:text-white',
              )
            }
          >
            <Icon aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
