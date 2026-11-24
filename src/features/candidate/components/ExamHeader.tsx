import { GraduationCap } from 'lucide-react';
import type { ReactNode } from 'react';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

interface ExamHeaderProps {
  title: string;
  children?: ReactNode;
}

export function ExamHeader({ title, children }: ExamHeaderProps) {
  useDocumentTitle(title);
  return (
    <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center gap-x-4 gap-y-2 bg-linear-to-r from-navy-900 to-navy-800 px-4 py-2 text-white lg:px-6">
      <span className="flex items-center gap-3 text-xl font-bold">
        <GraduationCap aria-hidden className="size-9 fill-sky-400 text-sky-500" strokeWidth={1.5} />
        ExamPro
      </span>
      <span aria-hidden className="hidden h-6 w-px bg-white/40 sm:block" />
      <h1 className="font-semibold">{title}</h1>
      <div className="ml-auto flex flex-wrap items-center gap-3">{children}</div>
    </header>
  );
}
