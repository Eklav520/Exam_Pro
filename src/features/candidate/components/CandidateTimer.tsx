import { Clock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useCountdown } from '@/shared/hooks/useCountdown';
import { formatClock } from '@/shared/lib/format';
import { examSubmitted, selectCandidate } from '../model/candidateSlice';

/** One per running screen. Submits the exam when time runs out. */
export function CandidateTimer({ variant }: { variant: 'card' | 'header' }) {
  const dispatch = useAppDispatch();
  const deadline = useAppSelector(selectCandidate).deadline ?? 0;
  const remaining = useCountdown(deadline, () => dispatch(examSubmitted()));
  const clock = formatClock(remaining);

  if (variant === 'card') {
    return (
      <div className="flex items-center justify-center gap-4 rounded-xl border border-green-200 bg-[#ecfcf0] px-6 py-4">
        <Clock aria-hidden className="size-11 text-green-700" strokeWidth={1.75} />
        <div>
          <p className="text-sm font-medium">Time Remaining</p>
          <p
            role="timer"
            aria-label="Time remaining"
            className="text-3xl font-bold text-green-800 tabular-nums"
          >
            {clock}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-lg bg-red-50 px-4 py-1.5 text-ink">
      <Clock aria-hidden className="size-6 text-danger" />
      <span className="hidden text-sm font-semibold sm:inline">Time Left</span>
      <span
        role="timer"
        aria-label="Time left"
        className="text-xl font-bold text-danger tabular-nums"
      >
        {clock}
      </span>
    </div>
  );
}
