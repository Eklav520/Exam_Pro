import { screen, within } from '@testing-library/react';
import { path } from '@/shared/config/paths';
import { renderApp } from '@/test/renderApp';

type As = 'u-admin' | 'u-setter' | 'u-official' | 'u-evaluator';

const open = (route: string, as: As = 'u-admin') => renderApp({ route, as });

const menuLinks = () =>
  within(screen.getByRole('navigation', { name: 'Main' }))
    .getAllByRole('link')
    .map((link) => link.textContent);

describe('staff screens', () => {
  it.each([
    [path.adminExams, 'u-admin', 'Examinations'],
    [path.adminMonitoring, 'u-admin', 'Examination Monitoring'],
    [path.adminAllocation, 'u-admin', 'Allocate Answer Papers'],
    [path.adminReports, 'u-admin', 'Reports'],
    [path.adminQuestionPapers, 'u-setter', 'My Paper Sets'],
    [path.adminApprovals, 'u-official', 'Question Paper Approval'],
    [path.adminFinalApproval, 'u-official', 'Result Review & Final Approval'],
    [path.adminAssignedPapers, 'u-evaluator', 'Assigned Answer Papers'],
    [path.adminWorkspace, 'u-evaluator', 'Evaluate Answer Paper'],
  ] as const)('%s renders for %s', async (route, as, heading) => {
    open(route, as);
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });

  it.each([
    [
      'u-admin',
      'Admin Dashboard',
      [
        'Dashboard',
        'Exam Setup',
        'Exam Monitoring',
        'Centres & Systems',
        'Evaluator Allocation',
        'Users & Roles',
        'Reports',
        'Settings',
      ],
    ],
    ['u-setter', 'Question Paper Setter Dashboard', ['Dashboard', 'My Paper Sets']],
    ['u-official', 'Higher Official Dashboard', ['Dashboard', 'Paper Approval', 'Result Release']],
    ['u-evaluator', 'Evaluator Dashboard', ['Dashboard', 'Assigned Papers']],
  ] as const)('gives %s its own dashboard and menu', async (as, dashboard, links) => {
    open(path.adminDashboard, as);
    expect(await screen.findByText(dashboard)).toBeInTheDocument();
    expect(menuLinks()).toEqual(links);
  });

  it.each([
    [path.adminQuestionPapers, 'u-admin'],
    [path.adminApprovals, 'u-admin'],
    [path.adminFinalApproval, 'u-evaluator'],
    [path.adminUsers, 'u-setter'],
    [path.adminExams, 'u-official'],
    [path.adminWorkspace, 'u-official'],
  ] as const)('sends %s away from another role (%s)', async (route, as) => {
    const { router } = open(route, as);
    await screen.findByRole('heading', { level: 1, name: /^Welcome, / });
    expect(router.state.location.pathname).toBe(path.adminDashboard);
  });

  it.each([
    ['u-admin', 'Allocate Answer Papers'],
    ['u-official', 'Result Review & Final Approval'],
    ['u-evaluator', 'Assigned Answer Papers'],
  ] as const)('Evaluation leads %s to its own screen', async (as, heading) => {
    renderApp({ route: path.adminEvaluation, as });
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });

  it('lets the evaluator send evaluated papers to the Higher Official', async () => {
    const { user } = open(path.adminDashboard, 'u-evaluator');
    expect(
      await screen.findByText('Send 2 answer papers to the Higher Official'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: /Review & Send/ }));
    await user.click(await screen.findByRole('button', { name: 'Send to Higher Official' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Send' }));
    expect(screen.getByRole('button', { name: 'Send to Higher Official' })).toBeDisabled();
    await user.click(screen.getByRole('link', { name: 'Dashboard' }));
    expect(await screen.findByText('Evaluate 3 answer papers')).toBeInTheDocument();
    expect(screen.queryByText(/to the Higher Official$/)).not.toBeInTheDocument();
  });

  it('lists sealed sets waiting for the Higher Official', async () => {
    open(path.adminDashboard, 'u-official');
    expect(
      await screen.findByText('Review sealed Set 2 – APPSC Computer Proficiency Test'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Prepared by Manoj Jain/)).toBeInTheDocument();
  });

  it('filters paper sets', async () => {
    const { user } = open(path.adminQuestionPapers, 'u-setter');
    // Priya's two drafts: CPT Set 1 and Group-II Set 1.
    await user.selectOptions(await screen.findByLabelText('Status'), 'Draft');
    expect(screen.getAllByRole('row')).toHaveLength(3);
    await user.type(screen.getByLabelText('Search paper set'), 'screening');
    expect(screen.getAllByRole('row')).toHaveLength(2);
    await user.selectOptions(
      screen.getByLabelText('Examination'),
      'APPSC Computer Proficiency Test',
    );
    expect(screen.getByText('No paper sets match these filters.')).toBeInTheDocument();
  });

  it('only lets a set under review be decided', async () => {
    const { user } = open(path.adminApprovals, 'u-official');
    const approve = await screen.findByRole('button', { name: 'Approve & Release' });
    expect(approve).toBeEnabled();
    await user.click(screen.getByRole('button', { name: /^Set 3/ }));
    expect(approve).toBeDisabled();
    expect(screen.getByRole('heading', { name: 'Paper Set Details – Set 3' })).toBeInTheDocument();
  });

  it('applies monitoring filters on Search', async () => {
    const { user } = open(path.adminMonitoring);
    await user.selectOptions(await screen.findByLabelText('Centre'), 'Centre – B');
    expect(screen.getByText('Diya Patel')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.queryByText('Diya Patel')).not.toBeInTheDocument();
    expect(screen.getByText('Karan Mehta')).toBeInTheDocument();
  });

  it('validates marks, totals the section and moves to the next task', async () => {
    const { user } = open(path.adminWorkspace, 'u-evaluator');
    const marks = await screen.findByLabelText(/Awarded Marks/);
    await user.clear(marks);
    await user.type(marks, '25');
    await user.click(screen.getByRole('button', { name: 'Save & Continue' }));
    expect(screen.getByText('Use 0 to 20')).toBeInTheDocument();

    await user.clear(marks);
    await user.type(marks, '17.5');
    expect(screen.getByText('17.5 / 60')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save & Continue' }));
    expect(screen.getByRole('tab', { name: 'Task 2 – Excel (20)' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByLabelText(/Awarded Marks/)).toHaveValue(null);
  });

  it('opens a candidate from the result table', async () => {
    const { user } = open(path.adminFinalApproval, 'u-official');
    await user.click(await screen.findByRole('button', { name: 'Review Karan Mehta' }));
    const table = screen.getByRole('table', { name: 'Marks for Karan Mehta' });
    expect(within(table).getByLabelText('Final marks for Section A – MCQ')).toHaveValue(34);
    expect(screen.getByText('Final marks: 78')).toBeInTheDocument();
  });
});
