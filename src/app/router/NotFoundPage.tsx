import { Link } from 'react-router-dom';
import { path } from '@/shared/config/paths';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { buttonClass } from '@/shared/ui';

export function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <main className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 mb-6 text-muted">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <Link to={path.home} className={buttonClass()}>
        Go to home
      </Link>
    </main>
  );
}
