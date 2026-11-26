import { createExamInput, createQuestion, examSchema } from './examSchema';

const validQuestion = () => {
  const question = createQuestion();
  question.text = 'Q';
  question.options.forEach((option, i) => (option.text = `Option ${i}`));
  question.correctOptionIds = [question.options[0]!.id];
  return question;
};
const task = { id: 't', app: 'MS Excel', title: 'Marks', instructions: 'Use SUM.', marks: 20 };
const validExam = () => ({ ...createExamInput(), title: 'Algebra', subject: 'Maths' });
const messages = (value: unknown) =>
  examSchema.safeParse(value).error?.issues.map((issue) => issue.message) ?? [];

describe('examSchema', () => {
  it('allows a draft without questions but not a published exam', () => {
    expect(messages(validExam())).toEqual([]);
    expect(messages({ ...validExam(), status: 'published' })).toEqual([
      'Add at least one question or task before publishing',
    ]);
  });

  it('accepts a published exam with only questions, or only tasks', () => {
    expect(messages({ ...validExam(), status: 'published', questions: [validQuestion()] })).toEqual(
      [],
    );
    expect(messages({ ...validExam(), status: 'published', tasks: [task] })).toEqual([]);
  });

  it('requires a correct answer, and only one for single-answer questions', () => {
    const none = { ...validQuestion(), correctOptionIds: [] };
    expect(messages({ ...validExam(), questions: [none] })).toContain('Choose the correct answer');

    const question = validQuestion();
    const both = { ...question, correctOptionIds: question.options.map((option) => option.id) };
    expect(messages({ ...validExam(), questions: [both] })).toContain(
      'A single-answer question has one correct option',
    );
    expect(messages({ ...validExam(), questions: [{ ...both, type: 'multiple' }] })).toEqual([]);
  });

  it('checks tasks', () => {
    expect(messages({ ...validExam(), tasks: [{ ...task, instructions: ' ' }] })).toEqual([
      'Enter the instructions',
    ]);
  });

  it('reports empty number inputs (NaN)', () => {
    expect(messages({ ...validExam(), durationMinutes: NaN })).toEqual(['Enter the duration']);
  });
});
