import clsx from 'clsx';
import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet, ScrollRestoration } from 'react-router-dom';
import { AccountMenu } from '@/features/staff';
import { path } from '@/shared/config/paths';
import { Brand, IconButton, ToastProvider } from '@/shared/ui';
import { Notifications } from './Notifications';
import { Sidebar } from './Sidebar';

interface AdminLayoutProps {
  /** The evaluation workspace uses the full width instead. */
  hasSidebar?: boolean;
}

export function AdminLayout({ hasSidebar = true }: AdminLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-surface">
        {hasSidebar && (
          <>
            <Sidebar isOpen={isMenuOpen} onNavigate={() => setIsMenuOpen(false)} />
            {isMenuOpen && (
              <div
                aria-hidden
                className="fixed inset-0 z-30 bg-ink/50 lg:hidden"
                onClick={() => setIsMenuOpen(false)}
              />
            )}
          </>
        )}
        <div className={clsx(hasSidebar && 'lg:pl-64')}>
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-surface px-4 lg:px-8">
            {hasSidebar ? (
              <IconButton
                icon={Menu}
                label="Open menu"
                aria-expanded={isMenuOpen}
                aria-controls="admin-sidebar"
                className="lg:hidden"
                onClick={() => setIsMenuOpen(true)}
              />
            ) : (
              <Link to={path.admin} className="rounded-lg">
                <Brand compact />
              </Link>
            )}
            <div className="ml-auto flex items-center gap-3">
              <Notifications />
              <span aria-hidden className="h-6 w-px bg-line" />
              <AccountMenu />
            </div>
          </header>
          <main className="px-4 py-6 lg:px-8">
            <Outlet />
          </main>
        </div>
        <ScrollRestoration />
      </div>
    </ToastProvider>
  );
}
