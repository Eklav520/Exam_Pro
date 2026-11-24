import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { renderApp } from '@/test/renderApp';

async function signIn(user: ReturnType<typeof renderApp>['user'], email: string, password: string) {
  await user.type(await screen.findByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
}

describe('authentication', () => {
  it('returns to the requested page after signing in', async () => {
    const { user, router } = renderApp({ route: '/results' });
    await signIn(user, 'student@exampro.test', 'student123');
    expect(await screen.findByRole('heading', { name: 'Results' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/results');
  });

  it('shows the server message for bad credentials', async () => {
    const { user } = renderApp({ route: '/login' });
    await signIn(user, 'student@exampro.test', 'wrong');
    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password.');
  });

  it('keeps students out of admin pages', async () => {
    renderApp({ route: '/admin/exams', as: 'u-student' });
    expect(await screen.findByRole('heading', { name: 'Welcome, Sam' })).toBeInTheDocument();
  });

  it('logs out and drops cached data', async () => {
    const { user, store } = renderApp({ as: 'u-student' });
    await user.click(await screen.findByRole('button', { name: 'Log out' }));
    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(store.getState().auth.token).toBeNull();
    expect(Object.keys(store.getState().api.queries)).toEqual([]);
  });

  it('ends the session when the API rejects the token', async () => {
    const { store } = renderApp({ as: 'u-student' });
    await screen.findByRole('heading', { name: 'Welcome, Sam' });
    server.use(
      http.get('*/results', () => HttpResponse.json({ message: 'Expired' }, { status: 401 })),
    );
    const { baseApi } = await import('@/shared/api/baseApi');
    store.dispatch(baseApi.util.invalidateTags(['Result']));
    await waitFor(() => expect(store.getState().auth.token).toBeNull());
    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });
});
