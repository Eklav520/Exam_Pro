import { useEffect } from 'react';
import { useRouteError } from 'react-router-dom';
import { Button } from '@/shared/ui';

export function RouteError() {
  const error = useRouteError();

  useEffect(() => {
    // Replace with your error-reporting service.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 mb-6 text-muted">
        This page failed to load. Any answers already saved are safe.
      </p>
      <Button onClick={() => window.location.reload()}>Reload page</Button>
    </main>
  );
}
