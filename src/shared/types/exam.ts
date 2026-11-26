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

/** A kind of question an exam can ask. */
export type SectionType =
  | 'mcq'
  | 'true_false'
  | 'fill_blank'
  | 'match'
  | 'short_answer'
  | 'descriptive'
  | 'ms_word'
  | 'ms_excel'
  | 'ms_powerpoint';

/** Questions of one type within a section, e.g. "20 MCQs of 2 marks". */
export interface QuestionGroup {
  id: string;
  type: SectionType;
  /** Questions, or tasks for practical work. */
  questionCount: number;
  marksPerQuestion: number;
  /** Marks lost per wrong answer. Only objective types use it. */
  negativeMarks: number;
}

/** One part of an exam's pattern. It can mix question types, e.g. Word, Excel and PowerPoint. */
export interface ExamSection {
  id: string;
  /** "Part A" */
  name: string;
  /** "General Studies"; may be empty. */
  title: string;
  instructions: string;
  groups: QuestionGroup[];
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
  /** E.g. "Notification No. 11/2025". Absent on exams created before patterns. */
  notificationNo?: string;
  /** yyyy-mm-dd, or empty when not scheduled yet. */
  examDate?: string;
  /** The exam's pattern. Paper setters prepare questions to match it. */
  sections?: ExamSection[];
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
