import { screen } from '@testing-library/react';
import { renderApp } from '@/test/renderApp';
import { DUMMY_PASSWORD, dummyAccounts } from './data/dummyAccounts';

const homes: Record<string, string> = {
  Admin: 'Welcome, Admin',
  'Question Paper Setter': 'Question Papers',
  'Higher Official': 'Question Paper Approval',
  Evaluator: 'Evaluate Answer Paper',
  Student: 'Verify Your Examination Seat',
};

type User = ReturnType<typeof renderApp>['user'];

async function signIn(user: User, email: string) {
  await user.type(await screen.findByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Password'), DUMMY_PASSWORD);
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
}

describe('dummy accounts', () => {
  it.each(dummyAccounts.map(({ label, email }) => [label, email] as const))(
    '%s opens on its own screen',
    async (label, email) => {
      const { user } = renderApp({ route: '/login' });
      await signIn(user, email);
      expect(
        await screen.findByRole('heading', { level: 1, name: homes[label] }),
      ).toBeInTheDocument();
    },
  );

  it('starts the next account on its own screen after logging out', async () => {
    const { user } = renderApp({ route: '/admin/reports', as: 'u-admin' });
    await user.click(await screen.findByRole('button', { name: 'Account menu, Admin' }));
    await user.click(screen.getByRole('button', { name: 'Log out' }));
    await signIn(user, 'official@exampro.test');
    expect(
      await screen.findByRole('heading', { name: 'Question Paper Approval' }),
    ).toBeInTheDocument();
  });
});
