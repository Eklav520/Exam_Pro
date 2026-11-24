import type { Exam, Question } from '@/shared/types';
import { gradeExam } from './grading';

const question = (id: string, correctOptionIds: string[], marks: number): Question => ({
  id,
  type: correctOptionIds.length > 1 ? 'multiple' : 'single',
  text: id,
  options: ['a', 'b', 'c'].map((optionId) => ({ id: optionId, text: optionId })),
  correctOptionIds,
  marks,
  explanation: '',
});

const exam: Exam = {
  id: 'e',
  title: 'E',
  subject: 'S',
  description: '',
  durationMinutes: 10,
  passPercentage: 50,
  negativeMarking: 0.25,
  status: 'published',
  questions: [question('q1', ['a'], 2), question('q2', ['a', 'b'], 2)],
};

describe('gradeExam', () => {
  it('awards full marks regardless of selection order', () => {
    const grade = gradeExam(exam, { q1: ['a'], q2: ['b', 'a'] });
    expect(grade).toMatchObject({ score: 4, percentage: 100, passed: true, correct: 2 });
  });

  it('gives no credit for partial multiple-answer selections and deducts marks', () => {
    const grade = gradeExam(exam, { q1: ['a'], q2: ['a'] });
    expect(grade).toMatchObject({ score: 1.5, incorrect: 1, passed: false });
  });

  it('does not penalise unanswered questions', () => {
    const grade = gradeExam(exam, { q1: ['a'] });
    expect(grade).toMatchObject({ score: 2, unanswered: 1, percentage: 50, passed: true });
  });

  it('never goes below zero', () => {
    expect(gradeExam(exam, { q1: ['b'], q2: ['c'] }).score).toBe(0);
  });
});
