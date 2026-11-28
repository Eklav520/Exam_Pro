import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from '@/app/router/routes';
import { makeStore } from '@/app/store';

interface RenderAppOptions {
  route?: string;
  /** Mock user to sign in as. */
  as?:
    | 'u-student'
    | 'u-admin'
    | 'u-setter'
    | 'u-setter-2'
    | 'u-setter-4'
    | 'u-official'
    | 'u-evaluator';
}

/** Renders the whole app against the mock API. */
export function renderApp({ route = '/', as }: RenderAppOptions = {}) {
  const store = makeStore(as ? { auth: { token: `mock-${as}`, hasLoggedOut: false } } : undefined);
  const router = createMemoryRouter(routes, { initialEntries: [route] });
  render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>,
  );
  return { store, router, user: userEvent.setup() };
}
