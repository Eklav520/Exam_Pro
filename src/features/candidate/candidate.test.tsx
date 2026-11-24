import { cleanup, screen, waitFor, within } from '@testing-library/react';
import { path, to } from '@/shared/config/paths';
import { renderApp } from '@/test/renderApp';
import { questions } from './data/questions';
import { sectionA } from './data/sample';
import { createProgress, type CandidateState } from './model/candidateSlice';
import { saveProgress } from './model/progressStorage';

const HOUR = 3_600_000;

function openExam(route: string = path.candidateHome, progress: Partial<CandidateState> = {}) {
  saveProgress({ ...createProgress(), deadline: Date.now() + HOUR, ...progress });
  return renderApp({ route, as: 'u-student' });
}

describe('candidate examination', () => {
  it('has the advertised number of questions, each with four different options', () => {
    expect(questions).toHaveLength(sectionA.questionCount);
    for (const question of questions) expect(new Set(question.options).size).toBe(4);
  });

  it('starts from the launch screen with a running clock', async () => {
    const { user } = renderApp({ as: 'u-student' });
    await user.click(await screen.findByRole('button', { name: 'Start Examination' }));
    expect(await screen.findByRole('heading', { name: 'Online Examination' })).toBeInTheDocument();
    expect(screen.getByRole('timer')).toHaveTextContent(/^02:(30:00|29:5\d)$/);
  });

  it('goes Home to the login page', async () => {
    const { user, router, store } = renderApp({ as: 'u-student' });
    await user.click(await screen.findByRole('button', { name: 'Home' }));
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(path.login);
    expect(store.getState().auth.token).toBeNull();
  });

  it('does not show questions before starting', async () => {
    renderApp({ route: path.candidateMcq, as: 'u-student' });
    expect(await screen.findByRole('heading', { name: 'Secure Exam Launch' })).toBeInTheDocument();
  });

  it('answers, marks and counts questions', async () => {
    const { user } = openExam(path.candidateMcq);
    await user.click(await screen.findByLabelText('B) Word'));
    await user.click(screen.getByRole('button', { name: 'Save & Next' }));
    await user.click(screen.getByRole('button', { name: 'Mark for Review' }));
    await user.click(screen.getByRole('button', { name: 'Question 12, Not Attempted' }));
    expect(screen.getByText(/correct file extension/)).toBeInTheDocument();
    for (const entry of [
      'Attempted (1)',
      'Not Attempted (17)',
      'Current (1)',
      'Marked for Review (1)',
    ]) {
      expect(screen.getByText(entry)).toBeInTheDocument();
    }
    await user.click(screen.getByRole('button', { name: 'Question 1, Attempted' }));
    expect(screen.getByLabelText('B) Word')).toBeChecked();
  });

  it('switches from Section A to Section B', async () => {
    const { user, router } = openExam(path.candidateMcq);
    await user.click(await screen.findByRole('button', { name: /^Section A/ }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText(/Section B/)).toBeChecked();
    await user.click(within(dialog).getByRole('button', { name: 'Switch Section' }));
    await waitFor(() => expect(router.state.location.pathname).toBe(to.candidateTask('word')));
  });

  it.each([path.candidateMcq, to.candidateTask('word')])(
    'shows the same header controls in both sections (%s)',
    async (route) => {
      openExam(route);
      expect(await screen.findByText('Auto Saved')).toBeInTheDocument();
      expect(screen.getByRole('timer', { name: 'Time left' })).toBeInTheDocument();
      for (const name of [
        'Open section navigator',
        'Toggle full screen',
        'Sound',
        /^Section [AB] ?, switch section$/,
      ]) {
        expect(screen.getByRole('button', { name })).toBeInTheDocument();
      }
    },
  );

  it('completes a task, and reopens it when edited', async () => {
    const { user } = openExam(to.candidateTask('excel'));
    const done = await screen.findByRole('button', { name: 'Mark as Completed' });
    await user.click(done);
    expect(screen.getByRole('button', { name: 'Completed' })).toBeDisabled();
    expect(screen.getAllByText('1 of 4 Completed').length).toBeGreaterThan(0);

    await user.type(screen.getByLabelText('Total, Diya Patel'), '271');
    expect(screen.getByLabelText('Formula for cell F4')).toHaveValue('271');
    expect(screen.getByRole('button', { name: 'Mark as Completed' })).toBeEnabled();
  });

  it('keeps work after a reload and clears it on logout', async () => {
    const { user, store } = openExam(to.candidateTask('word'));
    await user.type(await screen.findByLabelText('Document'), 'My report');
    cleanup();

    renderApp({ route: to.candidateTask('word'), as: 'u-student' });
    expect(await screen.findByLabelText('Document')).toHaveValue('My report');
    cleanup();

    const { sessionEnded } = await import('@/shared/api/session');
    store.dispatch(sessionEnded('logout'));
    renderApp({ route: to.candidateTask('word'), as: 'u-student' });
    expect(await screen.findByRole('heading', { name: 'Secure Exam Launch' })).toBeInTheDocument();
  });

  it('adds and edits slides', async () => {
    const { user } = openExam(to.candidateTask('powerpoint'));
    await user.click(await screen.findByRole('button', { name: 'New slide' }));
    await user.type(screen.getByLabelText('Slide title'), 'Summary');
    expect(screen.getByRole('button', { name: 'Slide 2' })).toHaveTextContent('Summary');
    await user.click(screen.getByRole('button', { name: 'Slide 1' }));
    expect(screen.getByLabelText('Slide title')).toHaveValue('');
  });

  it('warns about unfinished work, submits, and closes to the login page', async () => {
    const { user } = openExam(path.candidateHome, { answers: { 0: 1 } });
    await user.click(await screen.findByRole('button', { name: 'Submit Examination' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('19 of 20 questions are not answered.');
    expect(dialog).toHaveTextContent('3 of 3 tasks are not marked as completed.');
    await user.click(within(dialog).getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Exam Submitted Successfully!')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('cannot go back to the questions after submitting', async () => {
    openExam(path.candidateMcq, { submittedAt: new Date().toISOString() });
    expect(await screen.findByText('Exam Submitted Successfully!')).toBeInTheDocument();
  });

  it('submits by itself when time runs out', async () => {
    openExam(path.candidateMcq, { deadline: Date.now() + 700 });
    expect(await screen.findByText('Exam Submitted Successfully!')).toBeInTheDocument();
  });
});
