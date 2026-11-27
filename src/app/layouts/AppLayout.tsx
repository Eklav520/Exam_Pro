import clsx from 'clsx';
import { CalendarDays, FileCheck2, House, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useCurrentUser, useLogout } from '@/features/auth';
import { Notifications } from './admin/Notifications';
import { path } from '@/shared/config/paths';
import { Brand, Button, IconButton } from '@/shared/ui';

const nav = [
  { to: path.dashboard, label: 'Dashboard', icon: House },
  { to: path.exams, label: 'Exams', icon: CalendarDays },
  { to: path.results, label: 'Results', icon: FileCheck2 },
];

export function AppLayout() {
  const user = useCurrentUser();
  const logout = useLogout();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-canvas text-ink lg:pl-64">
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto bg-linear-to-b from-navy-800 to-navy-900 text-white',
          'transition-[translate,visibility] lg:visible lg:translate-x-0',
          sidebarOpen ? 'visible translate-x-0' : 'invisible -translate-x-full',
        )}
      >
        <div className="px-5 pt-6 pb-5">
          <Link to={path.dashboard} onClick={() => setSidebarOpen(false)} className="block rounded-lg">
            <Brand />
          </Link>
        </div>
        <nav aria-label="Primary" className="space-y-1 px-3 pb-6">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-700 text-white'
                    : 'text-white/75 hover:bg-white/10 hover:text-white',
                )
              }
            >
              <Icon aria-hidden className="size-4.5 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          aria-hidden
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-navy-800 px-4 text-white sm:px-6">
        <IconButton
          icon={sidebarOpen ? X : Menu}
          label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
          onClick={() => setSidebarOpen((open) => !open)}
          className="text-white hover:bg-white/10 lg:hidden"
        />
        <div className="ml-auto flex items-center gap-3 text-sm">
          <Notifications />
          {user && (
            <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 font-medium text-white">
              <span className="flex size-6 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
                {user.name
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
              {user.name}
            </span>
          )}
          <Button variant="ghost" className="text-white! hover:bg-white/15!" onClick={logout}>
            Log out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
