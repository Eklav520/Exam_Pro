import clsx from 'clsx';
import { useEffect, useRef, useState, type ReactNode } from 'react';

interface DropdownProps {
  label: string;
  trigger: ReactNode;
  /** For a trigger on a dark background. */
  inverse?: boolean;
  /** Receives a function that closes the panel. */
  children: (close: () => void) => ReactNode;
}

/** A button that opens a small panel; closes on Escape or a click outside. */
export function Dropdown({ label, trigger, inverse = false, children }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !ref.current?.contains(event.target)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      ref.current?.querySelector('button')?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={clsx(
          'flex items-center gap-2 rounded-lg p-1.5',
          inverse ? 'hover:bg-white/10' : 'hover:bg-canvas',
        )}
      >
        {trigger}
      </button>
      {isOpen && (
        <div className="absolute right-0 z-30 mt-2 w-64 rounded-xl border border-line bg-surface p-2 text-sm text-ink shadow-lg">
          {children(() => setIsOpen(false))}
        </div>
      )}
    </div>
  );
}
