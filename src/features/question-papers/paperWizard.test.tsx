import { cleanup, screen, within } from '@testing-library/react';
import { path, to } from '@/shared/config/paths';
import { renderApp } from '@/test/renderApp';

type User = ReturnType<typeof renderApp>['user'];

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

async function openWizard() {
  const app = renderApp({ route: path.adminPaperNew, as: 'u-setter' });
  await screen.findByRole('heading', { name: 'Create Question Paper – Set 5' });
  return app;
}

describe('setting a paper', () => {
  it('starts the setter on the paper list', async () => {
    const { user } = renderApp({ as: 'u-setter' });
    await screen.findByRole('heading', { name: 'Question Papers' });
    await user.click(screen.getByRole('link', { name: 'Create Paper Set' }));
    expect(
      await screen.findByRole('heading', { name: 'Create Question Paper – Set 5' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Role: Question Paper Setter')).toBeInTheDocument();
  });

  it('goes from setter to approval with its own questions', async () => {
    const { user } = await openWizard();
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
    await screen.findByRole('heading', { name: 'Question Papers' });
    const row = screen.getByRole('row', { name: /Set 5/ });
    expect(row).toHaveTextContent('Under Review');
    expect(screen.getByRole('button', { name: 'Edit Set 5' })).toBeDisabled();
    cleanup();

    // The Higher Official signs in on the same browser.
    const official = renderApp({ route: path.adminApprovals, as: 'u-official' });
    await official.user.click(await screen.findByRole('button', { name: /^Set 5/ }));
    expect(screen.getByText('1 Question, 1 Marks')).toBeInTheDocument();
    expect(screen.getByText('1 Task, 20 Marks')).toBeInTheDocument();
    // Approvers see the totals, not the questions.
    expect(screen.queryByText(/Which colour is the sky/)).not.toBeInTheDocument();
    await official.user.click(screen.getByRole('button', { name: 'Approve & Release' }));
    await official.user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Approve & Release' }),
    );
    expect(screen.getByRole('button', { name: /^Set 5/ })).toHaveTextContent('Approved');
  });

  it('keeps added questions when leaving without Save & Next', async () => {
    const { user } = await openWizard();
    await next(user);
    await addQuestion(user, 'Saved at once?');
    await user.click(screen.getByRole('link', { name: 'Dashboard' }));
    await user.click(await screen.findByRole('link', { name: 'Question Papers' }));
    await user.click(await screen.findByRole('button', { name: 'Edit Set 5' }));
    await screen.findByRole('heading', { name: 'Edit Question Paper – Set 5' });
    await next(user);
    expect(screen.getByText('Saved at once?')).toBeInTheDocument();
  });

  it('validates questions', async () => {
    const { user } = await openWizard();
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
    const { user } = await openWizard();
    await next(user);
    await next(user);
    await next(user);
    expect(screen.getByText('Add at least one question or practical task.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit for Approval' })).toBeDisabled();
    cleanup();
    renderApp({ route: path.adminQuestionPapers, as: 'u-setter' });
    expect(await screen.findByRole('row', { name: /Set 5/ })).toHaveTextContent('Draft');
  });

  it('shows the reviewer’s remarks after a return', async () => {
    const { user } = renderApp({ route: path.adminApprovals, as: 'u-official' });
    await user.click(await screen.findByRole('button', { name: 'Return for Modification' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Return' }));
    expect(within(dialog).getByText('Say what needs to change')).toBeInTheDocument();
    await user.type(within(dialog).getByLabelText(/What needs to change/), 'Fix question 4');
    await user.click(within(dialog).getByRole('button', { name: 'Return' }));
    cleanup();
    renderApp({ route: to.adminPaperEdit('set-2'), as: 'u-setter' });
    expect(await screen.findByRole('alert')).toHaveTextContent('Fix question 4');
  });

  it('cannot open a set under review', async () => {
    renderApp({ route: to.adminPaperEdit('set-2'), as: 'u-setter' });
    expect(await screen.findByText('Set 2 cannot be edited')).toBeInTheDocument();
  });

  it('duplicates and deletes drafts', async () => {
    const { user } = renderApp({ route: path.adminQuestionPapers, as: 'u-setter' });
    await user.click(await screen.findByRole('button', { name: 'Duplicate Set 3' }));
    expect(screen.getByRole('row', { name: /Set 5/ })).toHaveTextContent('Draft');
    await user.click(screen.getByRole('button', { name: 'Delete Set 5' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));
    expect(screen.queryByRole('row', { name: /Set 5/ })).not.toBeInTheDocument();
  });
});
