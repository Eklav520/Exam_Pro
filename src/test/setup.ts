import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup, configure } from '@testing-library/react';
import { resetDb } from '@/mocks/db';
import { server } from '@/mocks/server';
import { tokenStorage } from '@/shared/lib/storage';

// Registered on this `expect` rather than via '@testing-library/jest-dom/vitest': on
// Windows a lower-case drive letter can load Vitest twice, and that import would
// then extend the wrong instance.
expect.extend(matchers);

// Lazy-loaded pages are compiled on first use, which can be slow on a busy machine.
configure({ asyncUtilTimeout: 15_000 });

// jsdom does not implement modal dialogs.
HTMLDialogElement.prototype.showModal = function () {
  this.open = true;
};
HTMLDialogElement.prototype.close = function () {
  this.open = false;
};
window.scrollTo = () => undefined;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  localStorage.clear();
  resetDb();
  tokenStorage.clear();
  sessionStorage.clear();
});
afterAll(() => server.close());
