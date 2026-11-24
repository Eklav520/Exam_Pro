import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { db } from '@/mocks/db';
import { server } from '@/mocks/server';
import { renderApp } from '@/test/renderApp';

async function startExam() {
  const app = renderApp({ route: '/exams/js-fundamentals', as: 'u-student' });
  await app.user.click(await screen.findByRole('button', { name: 'Start exam' }));
  await screen.findByText('Question 1 of 5');
  return app;
}

async function submit(user: Awaited<ReturnType<typeof startExam>>['user']) {
  await user.click(screen.getByRole('button', { name: 'Submit exam' }));
  await user.click(
    within(await screen.findByRole('dialog')).getByRole('button', { name: 'Submit' }),
  );
}

describe('taking an exam', () => {
  it('answers, submits and shows the graded review', async () => {
    const { user, router } = await startExam();
    await user.click(screen.getByLabelText('"object"'));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByLabelText('"0"'));
    await submit(user);

    expect(await screen.findByRole('heading', { name: 'Answer review' })).toBeInTheDocument();
    expect(router.state.location.pathname).toMatch(/^\/results\//);
    // 2 marks correct, 2 x 0.25 deducted, out of 10.
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.getByText('Not passed')).toBeInTheDocument();
  });

  it('never sends the answer key to a candidate', async () => {
    const { store } = await startExam();
    const { queries } = store.getState().api;
    expect(JSON.stringify(queries)).not.toMatch(/correctOptionIds|explanation/);
  });

  it('autosaves answers and restores them after a reload', async () => {
    const { user, router } = await startExam();
    await user.click(screen.getByLabelText('"object"'));
    expect(screen.getByText('Saving…')).toBeInTheDocument();
    await screen.findByText('All answers saved', {}, { timeout: 3000 });
    expect(db.attempts[0]?.answers).toEqual({ js1: ['js1-o2'] });

    const { cleanup } = await import('@testing-library/react');
    cleanup();
    renderApp({ route: router.state.location.pathname, as: 'u-student' });
    expect(await screen.findByLabelText('"object"')).toBeChecked();
  });

  it('keeps the candidate on the exam when submitting fails, then retries', async () => {
    const { user } = await startExam();
    await user.click(screen.getByLabelText('"object"'));
    server.use(http.post('*/submit', () => HttpResponse.error(), { once: true }));
    await submit(user);
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not reach the server');

    await user.click(screen.getByRole('button', { name: 'Submit again' }));
    expect(await screen.findByRole('heading', { name: 'Answer review' })).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('submits automatically when time runs out', async () => {
    db.exams[0]!.durationMinutes = 1.5 / 60;
    const { user, router } = await startExam();
    await user.click(screen.getByLabelText('"object"'));
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/results\//), {
      timeout: 4000,
    });
    expect(await screen.findByText('20%')).toBeInTheDocument();
  });

  it('redirects a finished attempt to its result', async () => {
    const { user, router } = await startExam();
    const attemptPath = router.state.location.pathname;
    await submit(user);
    await screen.findByRole('heading', { name: 'Answer review' });
    await router.navigate(attemptPath);
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/results\//));
  });
});
