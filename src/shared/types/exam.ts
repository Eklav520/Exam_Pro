export type QuestionType = 'single' | 'multiple';
export type ExamStatus = 'draft' | 'published';

export interface QuestionOption {
  id: string;
  text: string;
}

/** Question as a candidate sees it. Never carries the answer key. */
export interface PublicQuestion {
  id: string;
  type: QuestionType;
  text: string;
  options: QuestionOption[];
  marks: number;
}

/** Question including the answer key. Only sent to admins, or after submission. */
export interface Question extends PublicQuestion {
  correctOptionIds: string[];
  explanation: string;
}

export type PracticalApp = 'MS Word' | 'MS Excel' | 'MS PowerPoint';

/** A hands-on task done in an office application and marked by an evaluator. */
export interface PracticalTask {
  id: string;
  app: PracticalApp;
  title: string;
  instructions: string;
  marks: number;
}

export interface ExamSummary {
  id: string;
  title: string;
  subject: string;
  description: string;
  durationMinutes: number;
  passPercentage: number;
  /** Fraction of a question's marks deducted for a wrong answer (0 = none). */
  negativeMarking: number;
  status: ExamStatus;
  questionCount: number;
  taskCount: number;
  /** Questions and tasks together. */
  totalMarks: number;
}

export interface Exam extends Omit<ExamSummary, 'questionCount' | 'taskCount' | 'totalMarks'> {
  questions: Question[];
  tasks: PracticalTask[];
}

export type ExamInput = Omit<Exam, 'id'>;

/** An exam as listed to a candidate. */
export interface StudentExam extends ExamSummary {
  /** Set while the candidate has an unfinished attempt. */
  activeAttemptId: string | null;
}
