import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { formatNumber } from '@/shared/lib/format';

const tones = {
  blue: { card: 'border-blue-100 bg-[#eef3fe]', icon: 'text-blue-600' },
  red: { card: 'border-red-100 bg-[#fef1ef]', icon: 'text-red-600' },
  teal: { card: 'border-teal-100 bg-[#e9f6f5]', icon: 'text-emerald-600' },
  green: { card: 'border-green-100 bg-[#eff9f1]', icon: 'text-green-600' },
  sky: { card: 'border-sky-100 bg-[#ebf6fe]', icon: 'text-sky-600' },
  amber: { card: 'border-amber-100 bg-[#fef7e8]', icon: 'text-amber-600' },
  rose: { card: 'border-rose-100 bg-[#fbf0f3]', icon: 'text-rose-600' },
} as const;

export type StatTone = keyof typeof tones;

interface StatCardProps {
  icon: LucideIcon;
  tone: StatTone;
  value: number;
  label: string;
}

/** Use inside a <dl>. */
export function StatCard({ icon: Icon, tone, value, label }: StatCardProps) {
  return (
    <div
      className={clsx('flex items-center gap-4 rounded-xl border px-4 py-3.5', tones[tone].card)}
    >
      <Icon aria-hidden className={clsx('size-8 shrink-0', tones[tone].icon)} strokeWidth={1.75} />
      <div className="flex flex-col-reverse">
        <dt className="text-sm leading-snug font-medium text-ink">{label}</dt>
        <dd className="text-xl font-bold text-ink tabular-nums">{formatNumber(value)}</dd>
      </div>
    </div>
  );
}
