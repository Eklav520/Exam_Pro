import { screen, waitFor, within } from '@testing-library/react';
import { db } from '@/mocks/db';
import { renderApp } from '@/test/renderApp';

describe('managing exams', () => {
  it('creates and publishes an exam', async () => {
    const { user } = renderApp({ route: '/admin/exams/new', as: 'u-admin' });
    await user.type(await screen.findByLabelText('Title'), 'World Geography');
    await user.type(screen.getByLabelText('Subject'), 'Geography');
    await user.selectOptions(screen.getByLabelText('Status'), 'published');

    await user.click(screen.getByRole('button', { name: 'Save exam' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Add at least one question');

    await user.click(screen.getByRole('button', { name: 'Add question' }));
    await user.type(screen.getByLabelText('Question text'), 'Capital of Japan?');
    await user.type(screen.getByLabelText('Option 1'), 'Kyoto');
    await user.type(screen.getByLabelText('Option 2'), 'Tokyo');
    await user.click(screen.getByLabelText('Option 2 is correct'));
    await user.click(screen.getByRole('button', { name: 'Save exam' }));

    expect(await screen.findByText('World Geography')).toBeInTheDocument();
    const saved = db.exams.at(-1);
    const question = saved?.questions[0];
    expect(saved?.status).toBe('published');
    expect(question?.correctOptionIds).toEqual([question?.options[1]?.id]);
  });

  it('preserves question ids and answer key when editing', async () => {
    const before = structuredClone(db.exams[0]!);
    const { user } = renderApp({ route: '/admin/exams/js-fundamentals/edit', as: 'u-admin' });
    const title = await screen.findByLabelText('Title');
    await user.clear(title);
    await user.type(title, 'Renamed exam');
    await user.click(screen.getByRole('button', { name: 'Save exam' }));
    // The edit page also shows the title, so wait until we are back on the list.
    await screen.findByRole('heading', { name: 'Examinations' });
    expect(await screen.findByText('Renamed exam')).toBeInTheDocument();
    expect(db.exams[0]).toEqual({ ...before, title: 'Renamed exam' });
  });

  it('deletes an exam after confirmation', async () => {
    const { user } = renderApp({ route: '/admin/exams', as: 'u-admin' });
    await user.click(await screen.findByRole('button', { name: 'Delete SQL Basics' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete exam' }),
    );
    await waitFor(() => expect(screen.queryByText('SQL Basics')).not.toBeInTheDocument());
    expect(db.exams.some((exam) => exam.id === 'sql-basics')).toBe(false);
  });
});
