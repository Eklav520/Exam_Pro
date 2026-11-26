import { screen, waitFor, within } from '@testing-library/react';
import { db } from '@/mocks/db';
import { renderApp } from '@/test/renderApp';

type User = ReturnType<typeof renderApp>['user'];

const click = (user: User, name: string) => user.click(screen.getByRole('button', { name }));

async function addQuestion(user: User) {
  await click(user, 'Add Question');
  const dialog = within(screen.getByRole('dialog'));
  await user.type(dialog.getByLabelText('Question *'), 'Capital of Japan?');
  for (const [letter, text] of [
    ['A', 'Kyoto'],
    ['B', 'Tokyo'],
    ['C', 'Osaka'],
    ['D', 'Nara'],
  ] as const) {
    await user.type(dialog.getByLabelText(`Option ${letter}`), text);
  }
  await user.click(dialog.getByLabelText('B is correct'));
  await user.click(dialog.getByRole('button', { name: 'Save Question' }));
}

describe('managing exams', () => {
  it('creates and publishes an exam with a question and a practical task', async () => {
    const { user } = renderApp({ route: '/admin/exams/new', as: 'u-admin' });
    await user.type(await screen.findByLabelText('Title *'), 'World Geography');
    await user.type(screen.getByLabelText('Subject *'), 'Geography');
    await user.click(screen.getByLabelText(/^Published/));

    await click(user, 'Save exam');
    expect(await screen.findByRole('alert')).toHaveTextContent('Add at least one question or task');
    expect(screen.getByRole('heading', { name: /Part A/ })).toBeInTheDocument();

    await addQuestion(user);
    expect(await screen.findByText('Capital of Japan?')).toBeInTheDocument();
    await click(user, 'Next');
    await click(user, 'Add Task');
    await user.type(screen.getByLabelText('Task Title *'), 'Country report');
    await user.type(screen.getByLabelText('Instructions *'), 'Write one page.');
    await click(user, 'Save Task');
    await click(user, 'Next');
    expect(screen.getByText('2 items, 21 marks')).toBeInTheDocument();
    await click(user, 'Save exam');

    expect(await screen.findByText('World Geography')).toBeInTheDocument();
    const saved = db.exams.at(-1);
    const question = saved?.questions[0];
    expect(saved?.status).toBe('published');
    expect(question?.correctOptionIds).toEqual([question?.options[1]?.id]);
    expect(saved?.tasks).toMatchObject([{ app: 'MS Word', title: 'Country report', marks: 20 }]);
  });

  it('checks the details before moving on', async () => {
    const { user } = renderApp({ route: '/admin/exams/new', as: 'u-admin' });
    await user.click(await screen.findByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Use at least 3 characters')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Part A/ })).not.toBeInTheDocument();
  });

  it('preserves question ids and answer key when editing', async () => {
    const before = structuredClone(db.exams[0]!);
    const { user } = renderApp({ route: '/admin/exams/group2-screening/edit', as: 'u-admin' });
    const title = await screen.findByLabelText('Title *');
    await user.clear(title);
    await user.type(title, 'Renamed exam');
    await click(user, 'Save exam');
    await screen.findByRole('heading', { name: 'Examinations' });
    expect(await screen.findByText('Renamed exam')).toBeInTheDocument();
    expect(db.exams[0]).toEqual({ ...before, title: 'Renamed exam' });
  });

  it('edits a question in its dialog', async () => {
    const { user } = renderApp({ route: '/admin/exams/group2-screening/edit', as: 'u-admin' });
    await user.click(await screen.findByRole('button', { name: 'Next' }));
    await screen.findByRole('heading', { name: /Part A/ });
    await user.click(screen.getByRole('button', { name: 'Edit question 1' }));
    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByLabelText('Question *')).toHaveValue(
      'Andhra State was formed on 1 October 1953 with which city as its capital?',
    );
    await user.clear(dialog.getByLabelText('Marks *'));
    await user.type(dialog.getByLabelText('Marks *'), '3');
    await user.click(dialog.getByRole('button', { name: 'Save Question' }));
    expect(screen.getByText('Total Marks: 11')).toBeInTheDocument();
  });

  it('filters and deletes exams', async () => {
    const { user } = renderApp({ route: '/admin/exams', as: 'u-admin' });
    await user.selectOptions(await screen.findByLabelText('Status'), 'Draft');
    expect(screen.queryByText('APPSC Group-II Services – Screening Test')).not.toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {
        name: 'Delete APPSC Panchayat Secretary (Grade-V) – Screening Test',
      }),
    );
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete exam' }),
    );
    await waitFor(() =>
      expect(
        screen.queryByText('APPSC Panchayat Secretary (Grade-V) – Screening Test'),
      ).not.toBeInTheDocument(),
    );
    expect(db.exams.some((exam) => exam.id === 'panchayat-secretary')).toBe(false);
  });
});
