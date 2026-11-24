import clsx from 'clsx';
import type { QuestionStatus } from '../model/candidateSlice';

const config: Record<QuestionStatus, { label: string; cell: string; swatch: string }> = {
  attempted: {
    label: 'Attempted',
    cell: 'border-green-300 bg-green-300 text-ink',
    swatch: 'bg-green-600',
  },
  not_attempted: {
    label: 'Not Attempted',
    cell: 'border-line bg-canvas text-ink',
    swatch: 'border border-muted/60',
  },
  current: {
    label: 'Current',
    cell: 'border-avatar bg-avatar text-white',
    swatch: 'bg-avatar',
  },
  marked: {
    label: 'Marked for Review',
    cell: 'border-amber-400 bg-amber-400 text-ink',
    swatch: 'bg-amber-400',
  },
};

const legend: QuestionStatus[] = ['attempted', 'not_attempted', 'current', 'marked'];

interface PaletteProps {
  statuses: QuestionStatus[];
  onSelect: (index: number) => void;
}

export function Palette({ statuses, onSelect }: PaletteProps) {
  return (
    <section className="flex-1 rounded-xl border border-line p-4">
      <h2 className="mb-3 font-bold">Question Palette</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-2 lg:grid-cols-5">
        {statuses.map((status, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Question ${index + 1}, ${config[status].label}`}
            aria-current={status === 'current' ? 'step' : undefined}
            onClick={() => onSelect(index)}
            className={clsx(
              'h-9 rounded-lg border text-sm font-semibold tabular-nums',
              config[status].cell,
            )}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {legend.map((status) => (
          <li key={status} className="flex items-center gap-3">
            <span className={clsx('size-4.5 rounded', config[status].swatch)} />
            {config[status].label} ({statuses.filter((item) => item === status).length})
          </li>
        ))}
      </ul>
    </section>
  );
}
