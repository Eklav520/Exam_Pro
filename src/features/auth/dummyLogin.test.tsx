import { screen } from '@testing-library/react';
import { renderApp } from '@/test/renderApp';
import { DUMMY_OTP, DUMMY_PASSWORD, dummyAccounts } from './data/dummyAccounts';

// Staff open on a dashboard of their own work; students on their exam.
const homeOf = ({ role, name }: (typeof dummyAccounts)[number]) =>
  role === 'student' ? 'Verify Your Examination Seat' : `Welcome, ${name}`;

type User = ReturnType<typeof renderApp>['user'];

async function signIn(user: User, email: string) {
  await user.type(await screen.findByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Password'), DUMMY_PASSWORD);
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  await user.type(await screen.findByLabelText('OTP'), DUMMY_OTP);
  await user.click(screen.getByRole('button', { name: 'Verify & Sign in' }));
}

describe('dummy accounts', () => {
  it.each(dummyAccounts.map((account) => [account.label, account] as const))(
    '%s opens on its own screen',
    async (_label, account) => {
      const { user } = renderApp({ route: '/login' });
      await signIn(user, account.email);
      expect(
        await screen.findByRole('heading', { level: 1, name: homeOf(account) }),
      ).toBeInTheDocument();
    },
  );

  it('starts the next account on its own screen after logging out', async () => {
    const { user } = renderApp({ route: '/admin/reports', as: 'u-admin' });
    await user.click(await screen.findByRole('button', { name: 'Account menu, Admin' }));
    await user.click(screen.getByRole('button', { name: 'Log out' }));
    await signIn(user, 'official@exampro.test');
    expect(await screen.findByRole('heading', { name: 'Welcome, Hari Om' })).toBeInTheDocument();
    expect(screen.getByText('Higher Official Dashboard')).toBeInTheDocument();
  });
});
