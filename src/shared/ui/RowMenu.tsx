import { EllipsisVertical } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { IconButton } from './IconButton';

interface RowMenuProps {
  label: string;
  items: { label: string; danger?: boolean; onSelect: () => void }[];
}

const GAP = 4;
const ITEM_HEIGHT = 40;

/** Menu for a table row. Positioned on the screen, so a scrolling table cannot clip it. */
export function RowMenu({ label, items }: RowMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);
  const isOpen = position !== null;

  useEffect(() => {
    if (!isOpen) return;
    const close = () => setPosition(null);
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !ref.current?.contains(event.target)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      close();
      ref.current?.querySelector('button')?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [isOpen]);

  const toggle = (button: HTMLElement) => {
    if (isOpen) {
      setPosition(null);
      return;
    }
    const rect = button.getBoundingClientRect();
    const height = items.length * ITEM_HEIGHT + 16;
    const fitsBelow = rect.bottom + GAP + height <= window.innerHeight;
    setPosition({
      top: fitsBelow ? rect.bottom + GAP : rect.top - GAP - height,
      right: document.documentElement.clientWidth - rect.right,
    });
  };

  return (
    <div ref={ref} className="inline-block">
      <IconButton
        icon={EllipsisVertical}
        label={label}
        aria-expanded={isOpen}
        onClick={(event) => toggle(event.currentTarget)}
      />
      {position && (
        <div
          style={position}
          className="fixed z-30 w-44 rounded-xl border border-line bg-surface p-2 text-left text-sm shadow-lg"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setPosition(null);
                item.onSelect();
              }}
              className={`block h-10 w-full rounded-lg px-3 text-left hover:bg-canvas ${item.danger ? 'text-danger' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
