import clsx from 'clsx';
import { Check, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { useLogout } from '@/features/auth';
import { Dropdown } from '@/shared/ui';
import { useStaffRole } from '../hooks';
import { staffRoles, type StaffRole } from '../model/staffRoles';
import { rolePreviewed } from '../model/staffSlice';

const itemClass = 'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-canvas';

export function RoleMenu() {
  const current = useStaffRole();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const logout = useLogout();

  return (
    <Dropdown
      label={`Account menu, ${current.label}`}
      trigger={
        <>
          <span className="flex size-9 items-center justify-center rounded-full bg-avatar text-sm font-bold text-white">
            {current.initials}
          </span>
          <span className="hidden font-semibold sm:inline">{current.label}</span>
          <ChevronDown aria-hidden className="size-4" />
        </>
      }
    >
      {(close) => (
        <>
          <p className="px-3 pt-1 pb-2 text-xs text-muted">Preview as role (design only)</p>
          {(Object.keys(staffRoles) as StaffRole[]).map((role) => (
            <button
              key={role}
              type="button"
              aria-current={role === current.id ? 'true' : undefined}
              className={clsx(itemClass, role === current.id && 'font-semibold text-brand-700')}
              onClick={() => {
                close();
                dispatch(rolePreviewed(role));
                void navigate(staffRoles[role].home);
              }}
            >
              <span className="flex-1">{staffRoles[role].label}</span>
              {role === current.id && <Check aria-hidden className="size-4" />}
            </button>
          ))}
          <div className="my-2 border-t border-line" />
          <button type="button" className={itemClass} onClick={logout}>
            <LogOut aria-hidden className="size-4" />
            Log out
          </button>
        </>
      )}
    </Dropdown>
  );
}
