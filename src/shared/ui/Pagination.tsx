import clsx from 'clsx';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}

const buttonStyle =
  'flex size-9 items-center justify-center rounded-lg border text-sm font-semibold tabular-nums disabled:cursor-not-allowed disabled:opacity-40';

export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  return (
    <nav aria-label="Pages" className="flex flex-wrap gap-1.5">
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={clsx(buttonStyle, 'border-line hover:bg-canvas')}
      >
        <ArrowLeft aria-hidden className="size-4" />
      </button>
      {Array.from({ length: pageCount }, (_item, index) => index + 1).map((number) => (
        <button
          key={number}
          type="button"
          aria-label={`Page ${number}`}
          aria-current={number === page ? 'page' : undefined}
          onClick={() => onChange(number)}
          className={clsx(
            buttonStyle,
            number === page
              ? 'border-brand-700 bg-brand-700 text-white'
              : 'border-line hover:bg-canvas',
          )}
        >
          {number}
        </button>
      ))}
      <button
        type="button"
        aria-label="Next page"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
        className={clsx(buttonStyle, 'border-line hover:bg-canvas')}
      >
        <ArrowRight aria-hidden className="size-4" />
      </button>
    </nav>
  );
}
