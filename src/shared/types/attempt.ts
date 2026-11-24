import type { PublicQuestion, Question } from './exam';

/** Selected option ids, keyed by question id. */
export type AnswerMap = Record<string, string[]>;

export interface Attempt {
  id: string;
  examId: string;
  examTitle: string;
  status: 'in_progress' | 'submitted';
  startedAt: string;
  expiresAt: string;
  /** Server clock at response time, so the countdown survives a wrong device clock. */
  serverTime: string;
  questions: PublicQuestion[];
  answers: AnswerMap;
  /** Increases with every edit; lets the server ignore out-of-order autosaves. */
  revision: number;
}

export interface AnswersPayload {
  answers: AnswerMap;
  revision: number;
}

export type QuestionOutcome = 'correct' | 'incorrect' | 'unanswered';

export interface QuestionReview {
  question: Question;
  selectedOptionIds: string[];
  outcome: QuestionOutcome;
  marksAwarded: number;
}

export interface ResultSummary {
  attemptId: string;
  examId: string;
  examTitle: string;
  subject: string;
  submittedAt: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passPercentage: number;
  passed: boolean;
  correct: number;
  incorrect: number;
  unanswered: number;
}

export interface Result extends ResultSummary {
  review: QuestionReview[];
}
