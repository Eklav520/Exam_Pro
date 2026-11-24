import clsx from 'clsx';
import { GraduationCap } from 'lucide-react';

/** `compact` drops the tagline on phones, for places such as the top bar. */
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={clsx('flex gap-3', compact ? 'items-center' : 'items-start')}>
      <GraduationCap
        aria-hidden
        className="size-10 shrink-0 fill-sky-400 text-sky-500"
        strokeWidth={1.5}
      />
      <span>
        <span className="block text-lg leading-tight font-bold">ExamPro</span>
        <span
          className={clsx('text-xs leading-snug opacity-75', compact ? 'hidden sm:block' : 'block')}
        >
          Examination Management &amp; Evaluation System
        </span>
      </span>
    </span>
  );
}
