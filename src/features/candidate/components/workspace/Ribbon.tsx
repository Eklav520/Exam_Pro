import clsx from 'clsx';
import {
  Bold,
  Clipboard,
  Copy,
  Italic,
  PaintBucket,
  Paintbrush,
  Scissors,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignStart,
  Underline,
  type LucideIcon,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { IconButton, usePreviewAction } from '@/shared/ui';

interface RibbonProps {
  tabs: string[];
  /** Background of the tab row. */
  className: string;
  /** Extra commands of this application, shown as text buttons. */
  commands: { group: string; items: string[] }[];
}

const commonGroups: { label: string; items: { icon: LucideIcon; label: string }[] }[] = [
  {
    label: 'Clipboard',
    items: [
      { icon: Clipboard, label: 'Paste' },
      { icon: Scissors, label: 'Cut' },
      { icon: Copy, label: 'Copy' },
      { icon: Paintbrush, label: 'Format Painter' },
    ],
  },
  {
    label: 'Font',
    items: [
      { icon: Bold, label: 'Bold' },
      { icon: Italic, label: 'Italic' },
      { icon: Underline, label: 'Underline' },
      { icon: PaintBucket, label: 'Fill Colour' },
    ],
  },
  {
    label: 'Alignment',
    items: [
      { icon: TextAlignStart, label: 'Align Left' },
      { icon: TextAlignCenter, label: 'Align Centre' },
      { icon: TextAlignEnd, label: 'Align Right' },
    ],
  },
];

/** Looks like an office toolbar; the commands are not connected yet. */
export function Ribbon({ tabs, className, commands }: RibbonProps) {
  const preview = usePreviewAction();
  const [active, setActive] = useState('Home');

  return (
    <div>
      <div className={clsx('flex overflow-x-auto px-2 pt-1 [scrollbar-width:thin]', className)}>
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            aria-pressed={tab === active}
            onClick={() => setActive(tab)}
            className={clsx(
              'rounded-t-md px-4 py-2 text-sm font-medium whitespace-nowrap',
              tab === active ? 'bg-surface text-ink' : 'text-white hover:bg-white/15',
            )}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex min-h-19 items-stretch divide-x divide-line overflow-x-auto border-b border-line bg-surface py-2 [scrollbar-width:thin]">
        {active === 'Home' ? (
          <>
            {commonGroups.map((group) => (
              <RibbonGroup key={group.label} label={group.label}>
                {group.items.map((item) => (
                  <IconButton
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    onClick={() => preview(item.label)}
                  />
                ))}
              </RibbonGroup>
            ))}
            {commands.map(({ group, items }) => (
              <RibbonGroup key={group} label={group} stacked>
                {items.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => preview(item)}
                    className="rounded px-2 py-0.5 text-left text-xs whitespace-nowrap hover:bg-canvas"
                  >
                    {item}
                  </button>
                ))}
              </RibbonGroup>
            ))}
          </>
        ) : (
          <p className="self-center px-4 text-sm text-muted">
            The {active} tools are not connected yet.
          </p>
        )}
      </div>
    </div>
  );
}

interface RibbonGroupProps {
  label: string;
  /** Two rows of commands instead of one, to save width. */
  stacked?: boolean;
  children: ReactNode;
}

function RibbonGroup({ label, stacked = false, children }: RibbonGroupProps) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-between px-3">
      <div className={stacked ? 'grid grid-flow-col grid-rows-2' : 'flex items-center'}>
        {children}
      </div>
      <span className="text-[0.6875rem] text-muted">{label}</span>
    </div>
  );
}
