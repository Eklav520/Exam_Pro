import type { AnswerMap, Exam, Question, QuestionReview, Result } from '@/shared/types';

const round = (value: number) => Math.round(value * 100) / 100;

function reviewQuestion(
  question: Question,
  selected: string[],
  negativeMarking: number,
): QuestionReview {
  if (selected.length === 0) {
    return { question, selectedOptionIds: [], outcome: 'unanswered', marksAwarded: 0 };
  }
  const isCorrect =
    selected.length === question.correctOptionIds.length &&
    question.correctOptionIds.every((id) => selected.includes(id));
  return {
    question,
    selectedOptionIds: selected,
    outcome: isCorrect ? 'correct' : 'incorrect',
    marksAwarded: isCorrect ? question.marks : round(-question.marks * negativeMarking),
  };
}

type Grade = Omit<Result, 'attemptId' | 'submittedAt'>;

/** All-or-nothing per question; the total never drops below zero. */
export function gradeExam(exam: Exam, answers: AnswerMap): Grade {
  const review = exam.questions.map((question) =>
    reviewQuestion(question, answers[question.id] ?? [], exam.negativeMarking),
  );
  const count = (outcome: QuestionReview['outcome']) =>
    review.filter((item) => item.outcome === outcome).length;
  const totalMarks = exam.questions.reduce((sum, question) => sum + question.marks, 0);
  const score = Math.max(0, round(review.reduce((sum, item) => sum + item.marksAwarded, 0)));
  const percentage = totalMarks > 0 ? round((score / totalMarks) * 100) : 0;

  return {
    examId: exam.id,
    examTitle: exam.title,
    subject: exam.subject,
    score,
    totalMarks,
    percentage,
    passPercentage: exam.passPercentage,
    passed: percentage >= exam.passPercentage,
    correct: count('correct'),
    incorrect: count('incorrect'),
    unanswered: count('unanswered'),
    review,
  };
}
