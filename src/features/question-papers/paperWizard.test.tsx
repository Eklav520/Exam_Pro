import { cleanup, screen, within } from '@testing-library/react';
import { path, to } from '@/shared/config/paths';
import { renderApp } from '@/test/renderApp';

type User = ReturnType<typeof renderApp>['user'];

// Priya's sets in the sample data: CPT Set 1 (a draft with questions) and
// Group-II Set 1 (assigned, not started). Sets 2–4 of CPT belong to other setters.
const GROUP2_SET = 'g2-set-1';
const GROUP2_TITLE = 'APPSC Group-II Services – Screening Test – Set 1';

const next = (user: User) => user.click(screen.getByRole('button', { name: 'Save & Next' }));

async function addQuestion(user: User, text: string) {
  await user.click(screen.getByRole('button', { name: 'Add Question' }));
  await user.type(screen.getByLabelText('Question *'), text);
  for (const [letter, option] of [
    ['A', 'Red'],
    ['B', 'Green'],
    ['C', 'Blue'],
    ['D', 'Black'],
  ] as const) {
    await user.type(screen.getByLabelText(`Option ${letter}`), option);
  }
  await user.click(screen.getByLabelText('C is correct'));
  await user.click(screen.getByRole('button', { name: 'Save Question' }));
  await screen.findByText(text);
}

async function openAssignedSet() {
  const app = renderApp({ route: to.adminPaperEdit(GROUP2_SET), as: 'u-setter' });
  await screen.findByRole('heading', { name: 'Edit Question Paper – Set 1' });
  return app;
}

describe('setting a paper', () => {
  it('starts the setter on their own assigned sets', async () => {
    const { user } = renderApp({ as: 'u-setter' });
    await screen.findByRole('heading', { name: 'Welcome, Priya Sharma' });
    expect(
      screen.getByText('Prepare Set 1 of APPSC Group-II Services – Screening Test'),
    ).toBeInTheDocument();
    expect(screen.getByText('Send it for approval by 15 Dec 2026.')).toBeInTheDocument();
    // Sets come from the Admin; setters do not create their own.
    expect(screen.queryByRole('link', { name: 'Create Paper Set' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'My Paper Sets' }));
    await screen.findByRole('heading', { name: 'My Paper Sets' });
    // Sets 2–4 belong to other setters.
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.queryByRole('button', { name: /^Duplicate/ })).not.toBeInTheDocument();
  });

  it('goes from setter to approval with its own questions', async () => {
    const { user } = await openAssignedSet();
    await next(user);
    await addQuestion(user, 'Which colour is the sky?');
    expect(screen.getByText('Total Questions: 1')).toBeInTheDocument();
    await next(user);

    await user.click(screen.getByRole('button', { name: 'Add Task' }));
    await user.type(screen.getByLabelText('Task Title *'), 'Write a letter');
    await user.type(screen.getByLabelText('Instructions *'), 'Use a heading.');
    await user.click(screen.getByRole('button', { name: 'Save Task' }));
    await screen.findByText('Write a letter');
    await next(user);

    expect(screen.getByText(/Section A – MCQ \(1 Questions, 1 Marks\)/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Submit for Approval' }));
    await screen.findByRole('heading', { name: 'My Paper Sets' });
    expect(screen.getByRole('row', { name: new RegExp(GROUP2_TITLE) })).toHaveTextContent(
      'Under Review',
    );
    expect(screen.getByRole('button', { name: `Edit ${GROUP2_TITLE}` })).toBeDisabled();
    cleanup();

    // The Higher Official signs in on the same browser.
    const official = renderApp({ route: path.adminApprovals, as: 'u-official' });
    await official.user.click(await screen.findByRole('button', { name: /^Set 1.*Screening/ }));
    expect(screen.getByText('1 Question, 1 Marks')).toBeInTheDocument();
    expect(screen.getByText('1 Task, 20 Marks')).toBeInTheDocument();
    // Approvers see the totals, not the questions.
    expect(screen.queryByText(/Which colour is the sky/)).not.toBeInTheDocument();
    await official.user.click(screen.getByRole('button', { name: 'Approve & Release' }));
    await official.user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Approve & Release' }),
    );
    expect(screen.getByRole('button', { name: /^Set 1.*Screening/ })).toHaveTextContent('Approved');
  });

  it('keeps added questions when leaving without Save & Next', async () => {
    const { user } = await openAssignedSet();
    await next(user);
    await addQuestion(user, 'Saved at once?');
    await user.click(screen.getByRole('link', { name: 'Dashboard' }));
    await user.click(await screen.findByRole('link', { name: 'My Paper Sets' }));
    await user.click(await screen.findByRole('button', { name: `Edit ${GROUP2_TITLE}` }));
    await screen.findByRole('heading', { name: 'Edit Question Paper – Set 1' });
    await next(user);
    expect(screen.getByText('Saved at once?')).toBeInTheDocument();
  });

  it('validates questions', async () => {
    const { user } = await openAssignedSet();
    await next(user);
    await user.click(screen.getByRole('button', { name: 'Add Question' }));
    await user.type(screen.getByLabelText('Option A'), 'Same');
    await user.type(screen.getByLabelText('Option B'), 'same');
    await user.click(screen.getByRole('button', { name: 'Save Question' }));
    for (const message of [
      'Enter the question',
      'This option is already used',
      'Choose the correct answer',
    ]) {
      expect(await screen.findByText(message)).toBeInTheDocument();
    }
    expect(screen.getAllByText('Enter this option')).toHaveLength(2);
  });

  it('edits and deletes questions', async () => {
    const { user } = renderApp({ route: to.adminPaperEdit('set-1'), as: 'u-setter' });
    await screen.findByRole('heading', { name: 'Edit Question Paper – Set 1' });
    await next(user);
    expect(screen.getByText('Total Marks: 40')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit question 1' }));
    const marks = screen.getByLabelText('Marks *');
    await user.clear(marks);
    await user.type(marks, '5');
    await user.click(screen.getByRole('button', { name: 'Save Question' }));
    expect(await screen.findByText('Total Marks: 43')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete question 1' }));
    expect(screen.getByText('Total Marks: 38')).toBeInTheDocument();
  });

  it('will not submit an empty paper, but keeps it as a draft', async () => {
    const { user } = await openAssignedSet();
    await next(user);
    await next(user);
    await next(user);
    expect(screen.getByText('Add at least one question or practical task.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit for Approval' })).toBeDisabled();
    cleanup();
    renderApp({ route: path.adminQuestionPapers, as: 'u-setter' });
    expect(await screen.findByRole('row', { name: new RegExp(GROUP2_TITLE) })).toHaveTextContent(
      'Draft',
    );
  });

  it('shows the reviewer’s remarks after a return', async () => {
    // Priya sends her CPT Set 1 for approval.
    const setter = renderApp({ route: to.adminPaperEdit('set-1'), as: 'u-setter' });
    await screen.findByRole('heading', { name: 'Edit Question Paper – Set 1' });
    for (let step = 0; step < 3; step++) await next(setter.user);
    await setter.user.click(screen.getByRole('button', { name: 'Submit for Approval' }));
    await screen.findByRole('heading', { name: 'My Paper Sets' });
    cleanup();

    const { user } = renderApp({ route: path.adminApprovals, as: 'u-official' });
    await user.click(await screen.findByRole('button', { name: /^Set 1.*Proficiency/ }));
    await user.click(screen.getByRole('button', { name: 'Return for Modification' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Return' }));
    expect(within(dialog).getByText('Say what needs to change')).toBeInTheDocument();
    await user.type(within(dialog).getByLabelText(/What needs to change/), 'Fix question 4');
    await user.click(within(dialog).getByRole('button', { name: 'Return' }));
    cleanup();

    renderApp({ route: path.adminDashboard, as: 'u-setter' });
    expect(
      await screen.findByText('Set 1 of APPSC Computer Proficiency Test was returned for changes'),
    ).toBeInTheDocument();
    expect(screen.getByText('Remarks: Fix question 4')).toBeInTheDocument();
    cleanup();
    renderApp({ route: to.adminPaperEdit('set-1'), as: 'u-setter' });
    expect(await screen.findByRole('alert')).toHaveTextContent('Fix question 4');
  });

  it('cannot open another setter’s set', async () => {
    renderApp({ route: to.adminPaperEdit('set-2'), as: 'u-setter' });
    expect(await screen.findByText('This paper set was not found')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /Edit Question Paper – / }),
    ).not.toBeInTheDocument();
  });
});
