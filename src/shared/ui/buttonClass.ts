import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800',
  secondary: 'border border-line bg-surface text-ink hover:bg-canvas',
  outline: 'border border-navy-800/60 bg-surface text-navy-800 hover:bg-canvas',
  ghost: 'text-muted hover:bg-canvas hover:text-ink',
  danger: 'bg-danger text-white hover:bg-danger-strong',
};

/** Button styling, also used to make a <Link> look like a button. */
export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md') {
  return clsx(
    'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-50',
    size === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2',
    variants[variant],
  );
}
