import { screen, waitFor, within } from '@testing-library/react';
import { db } from '@/mocks/db';
import { renderApp } from '@/test/renderApp';

type User = ReturnType<typeof renderApp>['user'];

const click = (user: User, name: string) => user.click(screen.getByRole('button', { name }));

describe('managing exams', () => {
  it('creates an exam whose sections mix question types', async () => {
    const { user } = renderApp({ route: '/admin/exams/new', as: 'u-admin' });
    await user.type(await screen.findByLabelText('Title *'), 'APPSC Group-III Services');
    await user.type(screen.getByLabelText('Subject *'), 'General Studies');
    await user.type(screen.getByLabelText('Notification No.'), 'Notification No. 21/2026');
    await user.click(screen.getByLabelText(/^Published/));

    await click(user, 'Save exam');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Add at least one section before publishing',
    );

    // Part A: 100 MCQs with negative marking, plus 10 fill in the blanks.
    await click(user, 'Add Section');
    await user.type(screen.getByLabelText('Section Title'), 'General Studies');
    await user.clear(screen.getByLabelText('Questions *'));
    await user.type(screen.getByLabelText('Questions *'), '100');
    await user.type(screen.getByLabelText('Negative Marks'), '.33');
    await user.click(screen.getByRole('checkbox', { name: 'Fill in the Blanks' }));
    expect(
      screen.getByText('Part A: 100 questions + 10 questions = 110 marks'),
    ).toBeInTheDocument();
    expect(screen.getByText('Marked automatically')).toBeInTheDocument();

    // An essay makes part of the section manual, and cannot lose marks.
    await user.click(screen.getByRole('checkbox', { name: 'Descriptive / Essay' }));
    const essay = within(screen.getByRole('group', { name: 'Descriptive / Essay in Part A' }));
    expect(essay.getByLabelText('Negative Marks')).toBeDisabled();
    expect(screen.getByText('Partly marked by evaluator')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Descriptive / Essay' }));
    expect(screen.getByText(/1 section · 110 questions · 110 marks/)).toBeInTheDocument();

    await click(user, 'Next');
    const pattern = within(screen.getByRole('table', { name: 'Exam Pattern' }));
    expect(pattern.getByRole('rowheader', { name: 'Part A' })).toHaveAttribute('rowspan', '2');
    expect(pattern.getByText('Fill in the Blanks')).toBeInTheDocument();
    expect(pattern.getByText('−0.33')).toBeInTheDocument();
    await click(user, 'Save exam');

    expect(await screen.findByText('APPSC Group-III Services')).toBeInTheDocument();
    const saved = db.exams.at(-1);
    expect(saved).toMatchObject({
      status: 'published',
      notificationNo: 'Notification No. 21/2026',
      questions: [],
    });
    expect(saved?.sections).toMatchObject([
      {
        name: 'Part A',
        title: 'General Studies',
        groups: [
          { type: 'mcq', questionCount: 100, negativeMarks: 0.33 },
          { type: 'fill_blank', questionCount: 10, negativeMarks: 0 },
        ],
      },
    ]);
  });

  it('needs at least one question type in a section', async () => {
    const { user } = renderApp({ route: '/admin/exams/new', as: 'u-admin' });
    await user.type(await screen.findByLabelText('Title *'), 'Empty part');
    await user.type(screen.getByLabelText('Subject *'), 'Any');
    await click(user, 'Next');
    await click(user, 'Add Section');
    await click(user, 'Remove Multiple Choice (MCQ) from Part A');
    await click(user, 'Save exam');
    expect(await screen.findByText('Add at least one question type')).toBeInTheDocument();
  });

  it('puts several practical applications in one section', async () => {
    const { user } = renderApp({ route: '/admin/exams/new', as: 'u-admin' });
    await user.type(await screen.findByLabelText('Title *'), 'Office skills');
    await user.type(screen.getByLabelText('Subject *'), 'Computers');
    await click(user, 'Next');
    await click(user, 'Add Section');
    await user.click(screen.getByRole('checkbox', { name: 'Multiple Choice (MCQ)' }));
    await user.click(screen.getByRole('checkbox', { name: 'MS Word Practical' }));
    await user.click(screen.getByRole('checkbox', { name: 'MS Excel Practical' }));
    expect(screen.getByRole('checkbox', { name: 'MS Word Practical' })).toBeChecked();
    expect(screen.getByText('Part A: 1 task + 1 task = 40 marks')).toBeInTheDocument();
    expect(screen.getByText('Marked by evaluator')).toBeInTheDocument();
  });

  it('starts from a ready-made pattern', async () => {
    const { user } = renderApp({ route: '/admin/exams/new', as: 'u-admin' });
    await user.type(await screen.findByLabelText('Title *'), 'CPT March');
    await user.type(screen.getByLabelText('Subject *'), 'Computers');
    await click(user, 'Next');
    await click(user, 'Use Pattern');
    expect(screen.getByText(/2 sections · 23 questions · 100 marks/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Part B – Practical' })).toBeInTheDocument();
    expect(screen.getByText('Part B: 1 task + 1 task + 1 task = 60 marks')).toBeInTheDocument();

    await click(user, 'Remove Part B');
    await click(user, 'Use Pattern');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Replace' }));
    expect(screen.getByText(/2 sections · 23 questions/)).toBeInTheDocument();
  });

  it('shows each exam’s sections in the list', async () => {
    renderApp({ route: '/admin/exams', as: 'u-admin' });
    const row = await screen.findByRole('row', { name: /APPSC Computer Proficiency Test/ });
    expect(row).toHaveTextContent(
      'Part B: MS Word Practical × 1, MS Excel Practical × 1, MS PowerPoint Practical × 1',
    );
    expect(row).toHaveTextContent('12 Mar 2026');
  });

  it('checks the details before moving on', async () => {
    const { user } = renderApp({ route: '/admin/exams/new', as: 'u-admin' });
    await user.click(await screen.findByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Use at least 3 characters')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add Section' })).not.toBeInTheDocument();
  });

  it('preserves question ids and answer key when editing', async () => {
    const exam = () => db.exams.find(({ id }) => id === 'group2-screening');
    const before = structuredClone(exam()!);
    const { user } = renderApp({ route: '/admin/exams/group2-screening/edit', as: 'u-admin' });
    const title = await screen.findByLabelText('Title *');
    await user.clear(title);
    await user.type(title, 'Renamed exam');
    await click(user, 'Save exam');
    await screen.findByRole('heading', { name: 'Examinations' });
    expect(await screen.findByText('Renamed exam')).toBeInTheDocument();
    expect(exam()).toEqual({ ...before, title: 'Renamed exam' });
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
