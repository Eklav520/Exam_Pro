import type { ReactNode } from 'react';
import { getErrorMessage } from '@/shared/api/getErrorMessage';
import { Alert } from './Alert';
import { Button } from './Button';

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-muted">
      <span
        aria-hidden
        className="size-5 animate-spin rounded-full border-2 border-brand-700 border-t-transparent"
      />
      {label}
    </div>
  );
}

export function PageError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <Alert
      action={
        onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )
      }
    >
      {getErrorMessage(error)}
    </Alert>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line px-6 py-12 text-center">
      <p className="font-medium text-ink">{title}</p>
      {children && <div className="mt-2 text-sm text-muted">{children}</div>}
    </div>
  );
}
