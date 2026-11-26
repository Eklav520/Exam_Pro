import { screen, within } from '@testing-library/react';
import { path } from '@/shared/config/paths';
import { renderApp } from '@/test/renderApp';

const open = (route: string) => renderApp({ route, as: 'u-admin' });

describe('admin screens', () => {
  it.each([
    [path.adminDashboard, 'Welcome, Admin'],
    [path.adminExams, 'Examinations'],
    [path.adminQuestionPapers, 'Question Papers'],
    [path.adminApprovals, 'Question Paper Approval'],
    [path.adminMonitoring, 'Examination Monitoring'],
    [path.adminAllocation, 'Allocate Answer Papers'],
    [path.adminWorkspace, 'Evaluate Answer Paper'],
    [path.adminFinalApproval, 'Result Review & Final Approval'],
    [path.adminReports, 'Reports'],
  ])('%s renders', async (route, heading) => {
    open(route);
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });

  it.each([
    ['u-admin', 'Allocate Answer Papers'],
    ['u-evaluator', 'Evaluate Answer Paper'],
  ] as const)('Evaluation leads %s to its own screen', async (as, heading) => {
    renderApp({ route: path.adminEvaluation, as });
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });

  it('lets the Admin move between both evaluation screens', async () => {
    const { user } = open(path.adminAllocation);
    await user.click(await screen.findByRole('link', { name: 'Final Approval' }));
    await screen.findByRole('heading', { name: 'Result Review & Final Approval' });
    await user.click(screen.getByRole('link', { name: 'Allocate Papers' }));
    await screen.findByRole('heading', { name: 'Allocate Answer Papers' });
  });

  it('filters paper sets', async () => {
    const { user } = open(path.adminQuestionPapers);
    await user.selectOptions(await screen.findByLabelText('Status'), 'Draft');
    expect(screen.getAllByRole('row')).toHaveLength(3);
    await user.type(screen.getByLabelText('Search paper set'), 'set 4');
    expect(screen.getAllByRole('row')).toHaveLength(2);
    await user.selectOptions(screen.getByLabelText('Examination'), 'Computer Fundamentals Exam');
    expect(screen.getByText('No paper sets match these filters.')).toBeInTheDocument();
  });

  it('only lets a set under review be decided', async () => {
    const { user } = open(path.adminApprovals);
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
    const { user } = open(path.adminWorkspace);
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
    const { user } = open(path.adminFinalApproval);
    await user.click(await screen.findByRole('button', { name: 'Review Karan Mehta' }));
    const table = screen.getByRole('table', { name: 'Marks for Karan Mehta' });
    expect(within(table).getByLabelText('Final marks for Section A – MCQ')).toHaveValue(34);
    expect(screen.getByText('Final marks: 78')).toBeInTheDocument();
  });
});
