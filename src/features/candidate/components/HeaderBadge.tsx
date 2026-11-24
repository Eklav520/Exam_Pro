import { LockKeyhole } from 'lucide-react';
import type { ReactNode } from 'react';

export function HeaderBadge({ children }: { children: ReactNode }) {
  return (
    <span className="flex min-w-32 items-center justify-center gap-1.5 rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white">
      <LockKeyhole aria-hidden className="size-3.5" />
      {children}
    </span>
  );
}
