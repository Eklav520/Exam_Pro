import clsx from 'clsx';
import { CircleCheck } from 'lucide-react';

export interface SectionSummary {
  id: string;
  title: string;
  detail: string;
  score: number;
  total: number;
  isComplete: boolean;
}

interface SectionListProps {
  sections: SectionSummary[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function SectionList({ sections, activeId, onSelect }: SectionListProps) {
  return (
    <section className="rounded-xl border border-line p-3">
      <h2 className="mb-3 px-1 font-bold">Sections</h2>
      <ul className="space-y-2">
        {sections.map((section) => {
          const isActive = section.id === activeId;
          return (
            <li key={section.id}>
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelect(section.id)}
                className={clsx(
                  'flex w-full items-center justify-between gap-2 rounded-lg border border-l-4 px-4 py-3 text-left text-sm',
                  isActive ? 'border-brand-700 bg-brand-50' : 'border-line hover:bg-canvas',
                )}
              >
                <span>
                  <span className="block font-semibold">{section.title}</span>
                  <span className="block text-muted">({section.detail})</span>
                  <span
                    className={clsx(
                      'mt-1.5 inline-block rounded-md px-2.5 py-0.5 font-bold tabular-nums',
                      section.isComplete
                        ? 'bg-success-soft text-success'
                        : 'bg-warning-soft text-warning',
                    )}
                  >
                    {section.score} / {section.total}
                  </span>
                </span>
                {section.isComplete && (
                  <CircleCheck
                    aria-label="Marking complete"
                    className="size-5 fill-emerald-600 text-white"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
