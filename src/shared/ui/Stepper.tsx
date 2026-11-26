import clsx from 'clsx';
import { Check, ChevronRight } from 'lucide-react';

interface StepperProps {
  steps: readonly string[];
  current: number;
  /** Steps that can be opened; by default those up to the current one. */
  reachable?: number;
  onSelect: (index: number) => void;
}

/** Shows progress through a form; steps within reach can be opened directly. */
export function Stepper({ steps, current, reachable = current + 1, onSelect }: StepperProps) {
  return (
    <ol className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-3 rounded-xl border border-line px-4 py-3 sm:justify-between">
      {steps.map((step, index) => {
        const isDone = index < current;
        const isCurrent = index === current;
        return (
          <li key={step} className="flex items-center gap-2">
            <button
              type="button"
              disabled={index >= reachable}
              aria-current={isCurrent ? 'step' : undefined}
              onClick={() => onSelect(index)}
              className={clsx(
                'flex items-center gap-2.5 rounded-full py-1 pr-4 pl-1 text-sm font-semibold disabled:cursor-not-allowed',
                isCurrent && 'bg-brand-50',
                isDone && 'hover:bg-canvas',
                index > current && index >= reachable && 'text-muted',
              )}
            >
              <span
                aria-hidden
                className={clsx(
                  'flex size-8 items-center justify-center rounded-full border-2 text-sm',
                  isCurrent && 'border-brand-700 bg-brand-700 text-white',
                  isDone && 'border-brand-700 text-brand-700',
                  index > current && 'border-line',
                )}
              >
                {isDone ? <Check className="size-4" strokeWidth={3} /> : index + 1}
              </span>
              {step}
            </button>
            {index < steps.length - 1 && (
              <ChevronRight aria-hidden className="hidden size-5 text-muted sm:block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
