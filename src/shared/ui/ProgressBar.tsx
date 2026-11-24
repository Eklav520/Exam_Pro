interface ProgressBarProps {
  label: string;
  /** 0 to 100 */
  percent: number;
}

export function ProgressBar({ label, percent }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 min-w-24 flex-1 overflow-hidden rounded-full bg-line"
      >
        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${percent}%` }} />
      </div>
      <span className="w-10 text-right tabular-nums">{percent}%</span>
    </div>
  );
}
