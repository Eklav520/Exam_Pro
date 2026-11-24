import type { ReactNode } from 'react';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

interface PageHeaderProps {
  title: string;
  /** Browser tab title, when it should differ from the heading. */
  documentTitle?: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  documentTitle = title,
  description,
  actions,
}: PageHeaderProps) {
  useDocumentTitle(documentTitle);
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-muted">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </header>
  );
}
