import { ChevronDown, LogOut } from 'lucide-react';
import { useCurrentUser, useLogout } from '@/features/auth';
import { Dropdown } from '@/shared/ui';
import { useStaffRole } from '../hooks';

export function AccountMenu() {
  const user = useCurrentUser();
  const role = useStaffRole();
  const logout = useLogout();

  return (
    <Dropdown
      label={`Account menu, ${role.label}`}
      trigger={
        <>
          <span className="flex size-9 items-center justify-center rounded-full bg-avatar text-sm font-bold text-white">
            {role.initials}
          </span>
          <span className="hidden font-semibold sm:inline">{role.label}</span>
          <ChevronDown aria-hidden className="size-4" />
        </>
      }
    >
      {() => (
        <>
          <div className="px-3 pt-1 pb-2">
            <p className="font-semibold">{user?.name}</p>
            <p className="truncate text-muted">{user?.email}</p>
          </div>
          <div className="mb-2 border-t border-line" />
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-canvas"
            onClick={logout}
          >
            <LogOut aria-hidden className="size-4" />
            Log out
          </button>
        </>
      )}
    </Dropdown>
  );
}
