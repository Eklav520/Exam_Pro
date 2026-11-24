import clsx from 'clsx';
import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';

interface TabsProps<Id extends string> {
  label: string;
  tabs: readonly { id: Id; label: string }[];
  active: Id;
  onChange: (id: Id) => void;
  variant?: 'underline' | 'solid';
  /** Content of the active tab. */
  children: ReactNode;
}

const styles = {
  underline: {
    list: 'mb-4 border-b border-line',
    tab: 'border-b-3 px-5 py-2.5',
    active: 'border-brand-700 text-brand-700',
    idle: 'border-transparent text-ink hover:text-brand-700',
  },
  solid: {
    list: 'mb-4 gap-3',
    tab: 'rounded-lg px-4 py-2.5',
    active: 'bg-brand-700 text-white',
    idle: 'bg-table-head text-ink hover:bg-line',
  },
} as const;

export function Tabs<Id extends string>({
  label,
  tabs,
  active,
  onChange,
  variant = 'underline',
  children,
}: TabsProps<Id>) {
  const baseId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const style = styles[variant];

  const handleKeyDown = (event: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (step === undefined) return;
    const index = tabs.findIndex((tab) => tab.id === active);
    const next = tabs[(index + step + tabs.length) % tabs.length];
    if (!next) return;
    event.preventDefault();
    onChange(next.id);
    listRef.current?.querySelector<HTMLElement>(`[data-tab="${next.id}"]`)?.focus();
  };

  return (
    <div>
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        onKeyDown={handleKeyDown}
        className={clsx('flex overflow-x-auto', style.list)}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-${tab.id}`}
              data-tab={tab.id}
              aria-selected={isActive}
              aria-controls={`${baseId}-panel`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.id)}
              className={clsx(
                'text-sm font-semibold whitespace-nowrap',
                style.tab,
                isActive ? style.active : style.idle,
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`${baseId}-panel`} aria-labelledby={`${baseId}-${active}`}>
        {children}
      </div>
    </div>
  );
}
