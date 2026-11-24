import { createExamInput, createQuestion, examSchema } from './examSchema';

const validQuestion = () => {
  const question = createQuestion();
  question.text = 'Q';
  question.options.forEach((option, i) => (option.text = `Option ${i}`));
  question.correctOptionIds = [question.options[0]!.id];
  return question;
};
const validExam = () => ({ ...createExamInput(), title: 'Algebra', subject: 'Maths' });
const messages = (value: unknown) =>
  examSchema.safeParse(value).error?.issues.map((issue) => issue.message) ?? [];

describe('examSchema', () => {
  it('allows a draft without questions but not a published exam', () => {
    expect(messages(validExam())).toEqual([]);
    expect(messages({ ...validExam(), status: 'published' })).toEqual([
      'Add at least one question before publishing',
    ]);
  });

  it('accepts a complete published exam', () => {
    const exam = { ...validExam(), status: 'published', questions: [validQuestion()] };
    expect(messages(exam)).toEqual([]);
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

  it('reports empty number inputs (NaN)', () => {
    expect(messages({ ...validExam(), durationMinutes: NaN })).toEqual(['Enter the duration']);
  });
});
