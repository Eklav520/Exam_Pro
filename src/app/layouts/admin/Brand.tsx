import clsx from 'clsx';
import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { path } from '@/shared/config/paths';

/** `compact` drops the tagline on phones, where it does not fit in the top bar. */
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to={path.admin}
      className={clsx('flex gap-3 rounded-lg', compact ? 'items-center' : 'items-start')}
    >
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
    </Link>
  );
}
