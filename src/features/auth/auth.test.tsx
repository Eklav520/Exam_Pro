import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { renderApp } from '@/test/renderApp';

type User = ReturnType<typeof renderApp>['user'];

async function enterPassword(user: User, email: string, password: string) {
  await user.type(await screen.findByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Continue' }));
}

async function enterOtp(user: User, otp: string) {
  await user.type(await screen.findByLabelText('OTP'), otp);
  await user.click(screen.getByRole('button', { name: 'Verify & Sign in' }));
}

async function signIn(user: User, email: string, password: string) {
  await enterPassword(user, email, password);
  await enterOtp(user, '123456');
}

describe('authentication', () => {
  it('returns to the requested page after signing in', async () => {
    const { user, router } = renderApp({ route: '/results' });
    await signIn(user, 'student@exampro.test', 'demo123');
    expect(await screen.findByRole('heading', { name: 'Results' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/results');
  });

  it('asks for the OTP sent to the registered mobile before signing in', async () => {
    const { user, store } = renderApp({ route: '/login' });
    await enterPassword(user, 'admin@exampro.test', 'demo123');
    expect(
      await screen.findByRole('heading', { name: 'Verify your mobile number' }),
    ).toBeInTheDocument();
    expect(screen.getByText('+91 ••••••2345')).toBeInTheDocument();
    expect(store.getState().auth.token).toBeNull();

    await enterOtp(user, '1234');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter the 6-digit OTP');
    await user.clear(screen.getByLabelText('OTP'));
    await enterOtp(user, '654321');
    expect(screen.getByRole('alert')).toHaveTextContent('Incorrect OTP');
    expect(store.getState().auth.token).toBeNull();

    await user.clear(screen.getByLabelText('OTP'));
    await enterOtp(user, '123456');
    await screen.findByRole('heading', { name: 'Welcome, Alex Dsouza' });
    expect(store.getState().auth.token).not.toBeNull();
  });

  it('goes back from the OTP step to change the account', async () => {
    const { user } = renderApp({ route: '/login' });
    await enterPassword(user, 'student@exampro.test', 'demo123');
    await user.click(await screen.findByRole('button', { name: 'Back' }));
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('shows the server message for bad credentials', async () => {
    const { user } = renderApp({ route: '/login' });
    await enterPassword(user, 'student@exampro.test', 'wrong');
    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password.');
    expect(screen.queryByLabelText('OTP')).not.toBeInTheDocument();
  });

  it('keeps students out of admin pages', async () => {
    renderApp({ route: '/admin/exams', as: 'u-student' });
    expect(
      await screen.findByRole('heading', { name: 'Verify Your Examination Seat' }),
    ).toBeInTheDocument();
  });

  it('logs out and drops cached data', async () => {
    const { user, store } = renderApp({ route: '/dashboard', as: 'u-student' });
    await user.click(await screen.findByRole('button', { name: 'Log out' }));
    expect(await screen.findByRole('button', { name: 'Continue' })).toBeInTheDocument();
    expect(store.getState().auth.token).toBeNull();
    expect(Object.keys(store.getState().api.queries)).toEqual([]);
  });

  it('ends the session when the API rejects the token', async () => {
    const { store } = renderApp({ route: '/dashboard', as: 'u-student' });
    await screen.findByRole('heading', { name: 'Welcome, Sam' });
    server.use(
      http.get('*/results', () => HttpResponse.json({ message: 'Expired' }, { status: 401 })),
    );
    const { baseApi } = await import('@/shared/api/baseApi');
    store.dispatch(baseApi.util.invalidateTags(['Result']));
    await waitFor(() => expect(store.getState().auth.token).toBeNull());
    expect(await screen.findByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });
});
