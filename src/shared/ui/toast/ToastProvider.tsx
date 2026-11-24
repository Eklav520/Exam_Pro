import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ToastContext } from './toastContext';

const VISIBLE_MS = 4_000;

/** Shows one short message at a time; a new message replaces the current one. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const show = useCallback((message: string) => setToast({ message }), []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext value={show}>
      {children}
      <div
        role="status"
        className="pointer-events-none fixed inset-x-4 bottom-24 z-50 flex justify-center"
      >
        {toast && (
          <p className="rounded-lg bg-navy-900 px-4 py-3 text-sm text-white shadow-lg">
            {toast.message}
          </p>
        )}
      </div>
    </ToastContext>
  );
}
