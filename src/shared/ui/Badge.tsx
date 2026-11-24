import type { ReactNode } from 'react';

const tones = {
  neutral: 'bg-line/70 text-ink',
  info: 'bg-info-soft text-info',
  violet: 'bg-violet-soft text-violet',
  brand: 'bg-brand-50 text-brand-800',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger-strong',
  warning: 'bg-warning-soft text-warning',
} as const;

interface BadgeProps {
  tone?: keyof typeof tones;
  children: ReactNode;
}

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
