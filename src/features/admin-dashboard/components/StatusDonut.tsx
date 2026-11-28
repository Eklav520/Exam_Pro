import { useState } from 'react';

interface StatusDonutProps {
  items: { label: string; count: number; color: string }[];
  /** Shown under the total in the middle. */
  totalLabel?: string;
}

const RADIUS = 50;
const STROKE = 22;
const GAP = 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Every count is in the legend, so nothing depends on colour or hovering. */
export function StatusDonut({ items, totalLabel = 'Exams' }: StatusDonutProps) {
  const [active, setActive] = useState<string | null>(null);
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const highlighted = items.find((item) => item.label === active);

  // With nothing to count, only the empty ring shows.
  const segments =
    total === 0
      ? []
      : items.map((item, index) => {
          const before = items.slice(0, index).reduce((sum, previous) => sum + previous.count, 0);
          return {
            ...item,
            length: (item.count / total) * CIRCUMFERENCE,
            offset: (before / total) * CIRCUMFERENCE,
          };
        });

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
      <div className="relative size-40 shrink-0">
        <svg viewBox="0 0 130 130" aria-hidden className="size-full -rotate-90">
          <circle
            cx="65"
            cy="65"
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            className="stroke-line/60"
          />
          {segments.map((segment) => (
            <circle
              key={segment.label}
              cx="65"
              cy="65"
              r={RADIUS}
              fill="none"
              stroke={segment.color}
              strokeWidth={STROKE}
              strokeDasharray={`${Math.max(0, segment.length - GAP)} ${CIRCUMFERENCE}`}
              strokeDashoffset={-segment.offset}
              opacity={active && active !== segment.label ? 0.35 : 1}
              onPointerEnter={() => setActive(segment.label)}
              onPointerLeave={() => setActive(null)}
            />
          ))}
        </svg>
        <p className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl leading-none font-bold">{highlighted?.count ?? total}</span>
          <span className="mt-1 text-xs font-medium">{highlighted?.label ?? totalLabel}</span>
        </p>
      </div>
      <ul className="space-y-2.5 text-sm">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-3"
            onPointerEnter={() => setActive(item.label)}
            onPointerLeave={() => setActive(null)}
          >
            <span className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label} ({item.count})
          </li>
        ))}
      </ul>
    </div>
  );
}
