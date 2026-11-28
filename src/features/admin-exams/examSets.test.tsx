import { cleanup, screen, within } from '@testing-library/react';
import { path, to } from '@/shared/config/paths';
import { renderApp } from '@/test/renderApp';

type User = ReturnType<typeof renderApp>['user'];

const CPT = 'computer-proficiency-test';

async function assign(user: User, setter: string, dueDate?: string) {
  const dialog = within(await screen.findByRole('dialog'));
  await user.selectOptions(dialog.getByLabelText('Paper Setter *'), setter);
  if (dueDate) await user.type(dialog.getByLabelText('Due Date'), dueDate);
  await user.click(dialog.getByRole('button', { name: 'Assign Set' }));
}

describe('assigning paper sets', () => {
  it('opens an exam’s sets from the exam list', async () => {
    const { user } = renderApp({ route: path.adminExams, as: 'u-admin' });
    const link = await screen.findByRole('link', {
      name: 'Paper sets for APPSC Computer Proficiency Test',
    });
    expect(link).toHaveTextContent('4 sets');
    await user.click(link);
    expect(await screen.findByRole('heading', { name: 'Paper Sets' })).toBeInTheDocument();
    expect(screen.getByText(/Part B – Practical:/).closest('li')).toHaveTextContent(
      'MS Word Practical × 1, MS Excel Practical × 1, MS PowerPoint Practical × 1',
    );
  });

  it('assigns a new set with the exam’s pattern, then duplicates it for another setter', async () => {
    const { user, store } = renderApp({ route: to.adminExamSets(CPT), as: 'u-admin' });
    await user.click(await screen.findByRole('button', { name: 'Assign Paper Set' }));
    expect(screen.getByLabelText('Set Name *')).toHaveValue('Set 5');
    await assign(user, 'Lakshmi Pillai', '2026-12-15');

    const row = await screen.findByRole('row', { name: /Set 5/ });
    expect(row).toHaveTextContent('Lakshmi Pillai');
    expect(row).toHaveTextContent('15 Dec 2026');
    expect(row).toHaveTextContent('Not started');

    await user.click(screen.getByRole('button', { name: 'Duplicate Set 5' }));
    expect(screen.getByRole('heading', { name: 'Duplicate Set 5' })).toBeInTheDocument();
    expect(screen.getByLabelText('Set Name *')).toHaveValue('Set 6');
    await assign(user, 'Rohan Das');
    expect(await screen.findByRole('row', { name: /Set 6/ })).toHaveTextContent('Rohan Das');

    const set6 = store.getState().papers.papers.find((paper) => paper.name === 'Set 6');
    expect(set6).toMatchObject({ examId: CPT, status: 'draft', mcqs: [], tasks: [] });
    expect(set6?.pattern?.map((section) => section.name)).toEqual(['Part A', 'Part B']);
  });

  it('gives each set to a different setter, with a unique name', async () => {
    const { user } = renderApp({ route: to.adminExamSets(CPT), as: 'u-admin' });
    await user.click(await screen.findByRole('button', { name: 'Assign Paper Set' }));
    const dialog = within(screen.getByRole('dialog'));
    await user.clear(dialog.getByLabelText('Set Name *'));
    await user.type(dialog.getByLabelText('Set Name *'), 'Set 2');
    await assign(user, 'Priya Sharma (has a set already)');
    expect(dialog.getByText('Set 2 already exists for this exam')).toBeInTheDocument();
    expect(
      dialog.getByText('This setter already has a set of this exam. Choose someone else.'),
    ).toBeInTheDocument();
  });

  it('removes a set only before the setter starts it', async () => {
    const { user } = renderApp({ route: to.adminExamSets(CPT), as: 'u-admin' });
    expect(await screen.findByRole('button', { name: 'Remove Set 1' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Assign Paper Set' }));
    await assign(user, 'Lakshmi Pillai');
    await user.click(await screen.findByRole('button', { name: 'Remove Set 5' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove' }));
    expect(screen.queryByRole('row', { name: /Set 5/ })).not.toBeInTheDocument();
  });

  it('gives every sample set of an exam to a different setter', async () => {
    renderApp({ route: to.adminExamSets(CPT), as: 'u-admin' });
    const names = ['Priya Sharma', 'Manoj Jain', 'Anita Desai', 'Vikram Singh'];
    for (const [index, name] of names.entries()) {
      expect(
        await screen.findByRole('row', { name: new RegExp(`Set ${index + 1}`) }),
      ).toHaveTextContent(name);
    }
  });

  it('shows an assigned set, its due date and pattern to its setter only', async () => {
    const GROUP1 = 'APPSC Group-I Services – Preliminary (General Aptitude)';
    const admin = renderApp({ route: to.adminExamSets('group1-prelims'), as: 'u-admin' });
    expect(await screen.findByText('No paper sets yet')).toBeInTheDocument();
    await admin.user.click(screen.getByRole('button', { name: 'Assign Paper Set' }));
    await assign(admin.user, 'Priya Sharma', '2026-12-20');
    await admin.user.click(await screen.findByRole('button', { name: 'Duplicate Set 1' }));
    await assign(admin.user, 'Manoj Jain');
    await screen.findByRole('row', { name: /Set 2/ });
    cleanup();

    // Priya signs in on the same browser, where the sets are kept until a server stores them.
    const { user } = renderApp({ route: path.adminDashboard, as: 'u-setter' });
    const task = await screen.findByText(`Prepare Set 1 of ${GROUP1}`);
    expect(
      within(task.closest('li')!).getByText('Send it for approval by 20 Dec 2026.'),
    ).toBeInTheDocument();
    await user.click(within(task.closest('li')!).getByRole('link', { name: /Continue/ }));

    expect(await screen.findByLabelText('Examination')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Examination')).toHaveValue(GROUP1);
    expect(screen.getByText('Send for approval by 20 Dec 2026.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Exam Pattern to Follow' })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Multiple Choice \(MCQ\)/ })).toHaveTextContent(
      'Multiple Choice (MCQ)41–4',
    );

    // Manoj's Set 2 is not Priya's.
    await user.click(screen.getByRole('link', { name: 'My Paper Sets' }));
    await screen.findByRole('heading', { name: 'My Paper Sets' });
    await user.selectOptions(screen.getByLabelText('Examination'), GROUP1);
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.queryByRole('row', { name: /Set 2/ })).not.toBeInTheDocument();
  });
});
