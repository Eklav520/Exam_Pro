import clsx from 'clsx';
import { useCountdown } from '@/shared/hooks/useCountdown';
import { formatCountdown } from '@/shared/lib/format';

const WARNING_MS = 60_000;

interface CountdownTimerProps {
  deadline: number;
  onExpire: () => void;
}

/** Isolated so the per-second tick re-renders only this component. */
export function CountdownTimer({ deadline, onExpire }: CountdownTimerProps) {
  const remaining = useCountdown(deadline, onExpire);
  const isLow = remaining <= WARNING_MS;
  return (
    <>
      <span
        role="timer"
        aria-label="Time remaining"
        className={clsx('text-lg font-semibold tabular-nums', isLow && 'text-danger')}
      >
        {formatCountdown(remaining)}
      </span>
      <span aria-live="assertive" className="sr-only">
        {isLow && 'Less than one minute remaining'}
      </span>
    </>
  );
}
