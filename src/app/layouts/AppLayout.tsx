import clsx from 'clsx';
import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router-dom';
import { useCurrentUser, useLogout } from '@/features/auth';
import { path } from '@/shared/config/paths';
import { Button } from '@/shared/ui';

const navigation = [
  { to: path.dashboard, label: 'Dashboard' },
  { to: path.exams, label: 'Exams' },
  { to: path.results, label: 'Results' },
];

export function AppLayout() {
  const user = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link to={path.home} className="flex items-center gap-2 font-semibold">
            <img src="/favicon.svg" alt="" className="size-6" />
            Exam Pro
          </Link>
          <nav aria-label="Main" className="order-last flex w-full gap-1 sm:order-none sm:w-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'rounded-md px-3 py-1.5 text-sm font-medium',
                    isActive ? 'bg-brand-50 text-brand-800' : 'text-muted hover:text-ink',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden text-muted sm:inline">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
      <ScrollRestoration />
    </div>
  );
}
