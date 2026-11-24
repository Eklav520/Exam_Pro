import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { env } from '@/shared/config/env';
import './index.css';

async function enableMocks() {
  // `DEV` is statically false in production builds, so mocks are never bundled there.
  if (import.meta.env.DEV && env.enableMocks) {
    const { worker } = await import('@/mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
  }
}

async function bootstrap() {
  await enableMocks();
  const root = document.getElementById('root');
  if (!root) throw new Error('Root element #root not found');
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
