import { screen, within } from '@testing-library/react';
import { path } from '@/shared/config/paths';
import { renderApp } from '@/test/renderApp';

const rows = () =>
  within(screen.getByRole('table', { name: 'Assigned answer papers' }))
    .getAllByRole('row')
    .slice(1);

describe('assigned answer papers', () => {
  it('shows progress, and filters by status, centre and registration number', async () => {
    const { user } = renderApp({ route: path.adminAssignedPapers, as: 'u-evaluator' });
    expect(await screen.findByText('5 of 8 papers evaluated')).toBeInTheDocument();
    expect(screen.getByText('2 ready to send')).toBeInTheDocument();

    const views = within(screen.getByRole('group', { name: 'Show answer papers' }));
    await user.click(views.getByRole('button', { name: 'Pending 3' }));
    expect(rows()).toHaveLength(3);
    expect(screen.getAllByRole('link', { name: /^Evaluate/ })).toHaveLength(3);

    await user.click(views.getByRole('button', { name: 'All 8' }));
    await user.selectOptions(screen.getByLabelText('Centre'), 'Centre – C');
    expect(rows()).toHaveLength(2);
    await user.type(screen.getByLabelText('Search registration number'), '0021');
    expect(rows()).toHaveLength(1);
    expect(rows()[0]).toHaveTextContent('Locked');
  });
});

describe('taking a break while evaluating', () => {
  it('saves the marks entered so far, closes, and resumes at the same task', async () => {
    const { user } = renderApp({ route: path.adminWorkspace, as: 'u-evaluator' });
    await user.click(await screen.findByRole('tab', { name: 'Task 2 – Excel (20)' }));
    await user.type(screen.getByLabelText(/Awarded Marks/), '25');
    await user.click(screen.getByRole('button', { name: 'Save & Close' }));
    // A wrong mark is never saved.
    expect(screen.getByText('Use 0 to 20')).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/Awarded Marks/));
    await user.type(screen.getByLabelText(/Awarded Marks/), '15');
    await user.click(screen.getByRole('button', { name: 'Save & Close' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Assigned Answer Papers' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Resume EXM20260001' }));
    expect(await screen.findByRole('tab', { name: 'Task 2 – Excel (20)' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByLabelText(/Awarded Marks/)).toHaveValue(15);
    expect(screen.getByText(/^Progress saved at/)).toBeInTheDocument();
  });
});
