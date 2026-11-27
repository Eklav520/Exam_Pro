import clsx from 'clsx';
import { PaperStatusBadge, type PaperSet } from '@/features/question-papers';

interface PaperSetListProps {
  sets: PaperSet[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function PaperSetList({ sets, selectedId, onSelect }: PaperSetListProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-line">
      <h2 className="border-b border-line px-4 py-4 font-bold">Paper Sets for Approval</h2>
      <ul className="divide-y divide-line">
        {sets.map((set) => {
          const isSelected = set.id === selectedId;
          return (
            <li key={set.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(set.id)}
                className={clsx(
                  'flex w-full items-center justify-between gap-2 border-l-4 px-4 py-3 text-left',
                  isSelected
                    ? 'border-brand-700 bg-brand-50'
                    : 'border-transparent hover:bg-canvas',
                )}
              >
                <span>
                  <span className="block font-semibold">{set.name}</span>
                  <span className="block text-sm">{set.exam}</span>
                  {set.setter && (
                    <span className="block text-sm text-muted">By {set.setter.name}</span>
                  )}
                  <span className="block text-sm text-muted">Submitted on: {set.submittedOn}</span>
                </span>
                <PaperStatusBadge status={set.status} />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
