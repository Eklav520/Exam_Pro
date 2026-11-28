import { screen, within } from '@testing-library/react';
import { path, to } from '@/shared/config/paths';
import type { ExamSection } from '@/shared/types';
import { renderApp } from '@/test/renderApp';
import { samplePapers } from './data/sample';
import { createAssignedSet, type PaperSet } from './model/paper';
import { savePapers } from './model/paperStorage';

type User = ReturnType<typeof renderApp>['user'];

const pattern: ExamSection[] = [
  {
    id: 'a',
    name: 'Part A',
    title: 'MCQ',
    instructions: 'Answer all questions.',
    groups: [
      { id: 'a-mcq', type: 'mcq', questionCount: 1, marksPerQuestion: 2, negativeMarks: 0.5 },
      { id: 'a-tf', type: 'true_false', questionCount: 1, marksPerQuestion: 1, negativeMarks: 0 },
      { id: 'a-fb', type: 'fill_blank', questionCount: 1, marksPerQuestion: 1, negativeMarks: 0 },
    ],
  },
  {
    id: 'b',
    name: 'Part B',
    title: 'Practice',
    instructions: '',
    groups: [
      { id: 'b-word', type: 'ms_word', questionCount: 1, marksPerQuestion: 20, negativeMarks: 0 },
    ],
  },
];

/** The Admin assigned Set 1 to Manoj and Set 2 to Vikram, as in the Paper Sets screen. */
function assignSets(): PaperSet[] {
  const exam = { id: 'appsc-test', title: 'APPSC', sections: pattern };
  const sets = [
    createAssignedSet({
      exam,
      name: 'Set 1',
      setter: { id: 'u-setter-2', name: 'Manoj Jain' },
      dueDate: '2026-12-31',
    }),
    createAssignedSet({
      exam,
      name: 'Set 2',
      setter: { id: 'u-setter-4', name: 'Vikram Singh' },
      dueDate: '2026-12-30',
    }),
  ];
  savePapers([...samplePapers, ...sets]);
  return sets;
}

const next = (user: User) => user.click(screen.getByRole('button', { name: 'Save & Next' }));

async function fillIn(user: User, label: string, value: string) {
  const dialog = within(screen.getByRole('dialog'));
  await user.type(dialog.getByLabelText(label), value);
}

describe('paper setters writing to the exam pattern', () => {
  it('lets Manoj and Vikram sign in and see only their own set', async () => {
    assignSets();
    renderApp({ route: path.adminQuestionPapers, as: 'u-setter-2' });
    const row = await screen.findByRole('row', { name: /APPSC – Set 1/ });
    expect(row).toHaveTextContent('0 of 4 questions');
    expect(screen.queryByRole('row', { name: /APPSC – Set 2/ })).not.toBeInTheDocument();
  });

  it('writes every question type the pattern asks for, then sends the set', async () => {
    const [manojSet] = assignSets();
    const { user, store } = renderApp({ route: to.adminPaperEdit(manojSet!.id), as: 'u-setter-2' });
    await screen.findByRole('heading', { name: 'Edit Question Paper – Set 1' });
    await next(user);
    expect(
      screen.getByRole('button', { name: 'Part A – MCQ', current: 'step' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Answer all questions.', { exact: false })).toBeInTheDocument();

    // MCQ
    await user.click(screen.getByRole('button', { name: 'Add Multiple Choice (MCQ) question' }));
    expect(
      screen.getByText('Multiple Choice (MCQ) · 2 marks each, −0.5 if wrong'),
    ).toBeInTheDocument();
    await fillIn(user, 'Question *', 'Which key saves a file?');
    for (const [letter, option] of [
      ['A', 'Ctrl+S'],
      ['B', 'Ctrl+P'],
      ['C', 'Ctrl+C'],
      ['D', 'Ctrl+V'],
    ]) {
      await fillIn(user, `Option ${letter}`, option!);
    }
    await user.click(screen.getByLabelText('A is correct'));
    await user.click(screen.getByRole('button', { name: 'Save Question' }));
    expect(
      screen.getByRole('button', { name: 'Add Multiple Choice (MCQ) question' }),
    ).toBeDisabled();
    expect(screen.getByText('1 of 1 questions written', { exact: false })).toBeInTheDocument();

    // True / False
    await user.click(screen.getByRole('button', { name: 'Add True / False question' }));
    await fillIn(user, 'Statement *', 'RAM keeps data after power off.');
    await user.click(within(screen.getByRole('dialog')).getByLabelText('False'));
    await user.click(screen.getByRole('button', { name: 'Save Question' }));

    // Fill in the blank needs a marked blank
    await user.click(screen.getByRole('button', { name: 'Add Fill in the Blanks question' }));
    await fillIn(user, 'Sentence *', 'The brain of the computer is the CPU');
    await fillIn(user, 'Answer *', 'CPU');
    await user.click(screen.getByRole('button', { name: 'Save Question' }));
    expect(screen.getByText('Mark the blank with ___ (three underscores)')).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Sentence *'));
    await fillIn(user, 'Sentence *', 'The brain of the computer is the ___.');
    await user.click(screen.getByRole('button', { name: 'Save Question' }));
    expect(screen.getByRole('row', { name: /Q3/ })).toHaveTextContent('CPU');

    // Part B – practical task
    await next(user);
    await user.click(screen.getByRole('button', { name: 'Add MS Word Practical task' }));
    await fillIn(user, 'Task Title *', 'Format a circular');
    await fillIn(user, 'Instructions *', 'Apply heading styles and a table.');
    await user.click(screen.getByRole('button', { name: 'Save Task' }));

    await next(user);
    expect(screen.getByText('4 of 4')).toBeInTheDocument();
    expect(screen.getByText('24 of 24')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Submit for Approval' }));
    const saved = store.getState().papers.papers.find((paper) => paper.id === manojSet!.id);
    expect(saved?.status).toBe('under_review');
    expect(saved?.questions?.map((question) => question.type)).toEqual([
      'mcq',
      'true_false',
      'fill_blank',
      'ms_word',
    ]);
  });

  it('keeps the set from being sent until the pattern is complete', async () => {
    const [, vikramSet] = assignSets();
    const { user } = renderApp({ route: to.adminPaperEdit(vikramSet!.id), as: 'u-setter-4' });
    await screen.findByRole('heading', { name: 'Edit Question Paper – Set 2' });
    for (let step = 0; step < 3; step += 1) await next(user);
    expect(
      screen.getByText('Part A: add 1 more Multiple Choice (MCQ) question.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Part B: add 1 more MS Word Practical task.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit for Approval' })).toBeDisabled();
  });
});
