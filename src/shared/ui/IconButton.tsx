import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  /** Read by screen readers and shown as a tooltip. */
  label: string;
  danger?: boolean;
  /** For dark backgrounds. */
  inverse?: boolean;
}

export function IconButton({
  icon: Icon,
  label,
  danger = false,
  inverse = false,
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={clsx(
        'inline-flex size-8 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        danger && 'text-danger hover:bg-danger-soft',
        inverse && 'text-white hover:bg-white/15',
        !danger && !inverse && 'text-navy-800 hover:bg-canvas',
        className,
      )}
      {...rest}
    >
      <Icon aria-hidden className="size-[1.125rem]" strokeWidth={1.9} />
    </button>
  );
}
