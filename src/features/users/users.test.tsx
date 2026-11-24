import { screen, within } from '@testing-library/react';
import { path } from '@/shared/config/paths';
import { renderApp } from '@/test/renderApp';

async function open() {
  const app = renderApp({ route: path.adminUsers, as: 'u-admin' });
  await screen.findByRole('heading', { name: 'Admin – Role & Access Management' });
  return app;
}

const bodyRows = () =>
  within(screen.getByRole('table', { name: 'Users' }))
    .getAllByRole('row')
    .slice(1);

describe('users and roles', () => {
  it('shows the first 8 of 44 users and pages through the rest', async () => {
    const { user } = await open();
    expect(screen.getByText('Showing 1 – 8 of 44 users')).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(8);
    await user.click(screen.getByRole('button', { name: 'Page 6' }));
    expect(screen.getByText('Showing 41 – 44 of 44 users')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('matches the counts on the role cards', async () => {
    const { user } = await open();
    for (const [role, count] of [
      ['Admin', 4],
      ['Question Paper Setter', 12],
      ['Higher Official', 3],
      ['Evaluator', 25],
    ] as const) {
      await user.selectOptions(screen.getByLabelText('Filter by role'), role);
      expect(screen.getByText(new RegExp(`of ${count} users$`))).toBeInTheDocument();
    }
  });

  it('searches from any page', async () => {
    const { user } = await open();
    await user.click(screen.getByRole('button', { name: 'Page 5' }));
    await user.type(screen.getByLabelText('Search users'), 'hema');
    expect(bodyRows()).toHaveLength(1);
    expect(screen.getByText('hema.gupta@exampro.in')).toBeInTheDocument();
  });

  it('validates and adds a user', async () => {
    const { user } = await open();
    await user.click(screen.getByRole('button', { name: 'Create User' }));
    for (const message of ['Enter the full name', 'Enter a valid email address', 'Select a role']) {
      expect(await screen.findByText(message)).toBeInTheDocument();
    }
    await user.type(screen.getByLabelText(/^Full Name/), 'Test Person');
    await user.type(screen.getByLabelText(/^Email/), 'Ravi.Kumar@exampro.in');
    await user.selectOptions(screen.getByLabelText('Role *'), 'Evaluator');
    await user.click(screen.getByRole('button', { name: 'Create User' }));
    expect(await screen.findByText('Another user has this email')).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/^Email/));
    await user.type(screen.getByLabelText(/^Email/), 'test.person@exampro.in');
    await user.click(screen.getByRole('button', { name: 'Create User' }));
    expect(await screen.findByRole('heading', { name: 'Users (45)' })).toBeInTheDocument();
    expect(bodyRows()[0]).toHaveTextContent('Test Person');
    expect(screen.getByLabelText(/^Full Name/)).toHaveValue('');
  });

  it('edits a user, and Cancel goes back to adding', async () => {
    const { user } = await open();
    await user.click(screen.getByRole('button', { name: 'Edit Ravi Kumar' }));
    const name = screen.getByLabelText(/^Full Name/);
    expect(name).toHaveValue('Ravi Kumar');
    expect(name).toHaveFocus();
    await user.clear(name);
    await user.type(name, 'Ravi K');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(await screen.findByText('Ravi K')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit Priya Sharma' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('heading', { name: 'Add New User' })).toBeInTheDocument();
  });

  it('deactivates a user from the row menu', async () => {
    const { user } = await open();
    await user.click(screen.getByRole('button', { name: 'More actions for Ravi Kumar' }));
    await user.click(screen.getByRole('button', { name: 'Deactivate' }));
    expect(bodyRows()[0]).toHaveTextContent('Inactive');
  });

  it('keeps the Admin permissions locked', async () => {
    const { user } = await open();
    await user.click(screen.getByRole('tab', { name: 'Roles & Permissions' }));
    expect(screen.getByLabelText('Admin: Users & Roles')).toBeDisabled();
    const evaluatorReports = screen.getByLabelText('Evaluator: Reports');
    await user.click(evaluatorReports);
    expect(evaluatorReports).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(evaluatorReports).not.toBeChecked();
  });

  it('shows access logs', async () => {
    const { user } = await open();
    await user.click(screen.getByRole('tab', { name: 'Access Logs' }));
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });
});
