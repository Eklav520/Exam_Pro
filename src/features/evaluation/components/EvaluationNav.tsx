import clsx from 'clsx';
import { NavLink } from 'react-router-dom';
import { useStaffRole } from '@/features/staff';
import { path } from '@/shared/config/paths';

const links = [
  { to: path.adminAllocation, label: 'Allocate Papers' },
  { to: path.adminFinalApproval, label: 'Final Approval' },
];

/** The Admin has two evaluation screens; other roles have one and need no switch. */
export function EvaluationNav() {
  if (useStaffRole().id !== 'admin') return null;
  return (
    <nav aria-label="Evaluation" className="mb-5 flex w-fit gap-1 rounded-xl bg-table-head p-1">
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            clsx(
              'rounded-lg px-4 py-2 text-sm font-semibold',
              isActive ? 'bg-surface text-brand-700 shadow-sm' : 'text-ink hover:bg-line',
            )
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
