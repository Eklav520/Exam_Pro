import type { ReactNode } from 'react';

interface FilterBarProps {
  label: string;
  /** Given when filters apply on a button press rather than immediately. */
  onSubmit?: () => void;
  children: ReactNode;
}

export function FilterBar({ label, onSubmit, children }: FilterBarProps) {
  return (
    <form
      role="search"
      aria-label={label}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
      className="mb-5 flex flex-wrap items-end gap-4 rounded-xl border border-line bg-surface p-4"
    >
      {children}
    </form>
  );
}
