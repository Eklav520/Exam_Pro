import type { ReactNode } from 'react';

export function Alert({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger-strong"
    >
      <div>{children}</div>
      {action}
    </div>
  );
}
