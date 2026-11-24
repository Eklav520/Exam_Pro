import clsx from 'clsx';
import { Card } from '@/shared/ui';
import type { QuestionStatus } from '../model/attemptSlice';

const statusStyles: Record<QuestionStatus, string> = {
  answered: 'border-brand-700 bg-brand-700 text-white',
  skipped: 'border-warning bg-warning-soft text-warning',
  unseen: 'border-line bg-surface text-muted',
};

const statusLabels: Record<QuestionStatus, string> = {
  answered: 'answered',
  skipped: 'not answered',
  unseen: 'not seen',
};

interface QuestionPaletteProps {
  items: { id: string; status: QuestionStatus; isMarked: boolean }[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export function QuestionPalette({ items, currentIndex, onSelect }: QuestionPaletteProps) {
  return (
    <Card>
      <nav aria-label="Questions">
        <h2 className="mb-3 text-sm font-semibold">Questions</h2>
        <div className="grid grid-cols-[repeat(auto-fill,2.5rem)] gap-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-current={index === currentIndex ? 'step' : undefined}
              aria-label={`Question ${index + 1}, ${statusLabels[item.status]}${item.isMarked ? ', marked for review' : ''}`}
              onClick={() => onSelect(index)}
              className={clsx(
                'relative size-10 rounded-md border text-sm font-medium tabular-nums',
                statusStyles[item.status],
                index === currentIndex && 'ring-2 ring-ink ring-offset-2',
              )}
            >
              {index + 1}
              {item.isMarked && (
                <span
                  aria-hidden
                  className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-white bg-danger"
                />
              )}
            </button>
          ))}
        </div>
      </nav>
      <ul className="mt-5 space-y-2 text-xs text-muted">
        {(['answered', 'skipped', 'unseen'] as const).map((status) => (
          <li key={status} className="flex items-center gap-2">
            <span className={clsx('size-4 rounded border', statusStyles[status])} />
            <span className="first-letter:uppercase">{statusLabels[status]}</span>
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span className="mx-0.5 size-3 rounded-full bg-danger" />
          Marked for review
        </li>
      </ul>
    </Card>
  );
}
