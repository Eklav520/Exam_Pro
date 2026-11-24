import clsx from 'clsx';

export function StatusDot({ isPositive, label }: { isPositive: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className={clsx('size-2 rounded-full', isPositive ? 'bg-green-600' : 'bg-muted/60')}
      />
      {label}
    </span>
  );
}
