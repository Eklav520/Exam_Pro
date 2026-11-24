import clsx from 'clsx';
import { Check } from 'lucide-react';
import type { StepState } from '../data/sample';

const stateLabels: Record<StepState, string> = {
  done: 'done',
  current: 'in progress',
  upcoming: 'not started',
};

export function WorkflowProgress({ steps }: { steps: { label: string; state: StepState }[] }) {
  return (
    <ol className="flex flex-col gap-4 sm:flex-row sm:gap-0">
      {steps.map((step, index) => (
        <li
          key={step.label}
          aria-current={step.state === 'current' ? 'step' : undefined}
          className="relative flex flex-1 items-center gap-3 sm:flex-col sm:text-center"
        >
          {index > 0 && (
            <span
              aria-hidden
              className={clsx(
                'absolute top-4 right-1/2 hidden h-0.5 w-full -translate-y-1/2 sm:block',
                step.state === 'upcoming' ? 'bg-line' : 'bg-emerald-600',
              )}
            />
          )}
          <span
            aria-hidden
            className={clsx(
              'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-4',
              step.state === 'done' && 'border-emerald-100 bg-emerald-600 text-white',
              step.state === 'current' && 'border-white bg-brand-700 ring-2 ring-brand-700',
              step.state === 'upcoming' && 'border-line bg-surface',
            )}
          >
            {step.state === 'done' && <Check className="size-4" strokeWidth={3} />}
          </span>
          <span
            className={clsx(
              'text-sm leading-snug sm:max-w-24',
              step.state === 'current' ? 'font-bold' : 'font-medium',
            )}
          >
            {step.label}
            <span className="sr-only">, {stateLabels[step.state]}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
