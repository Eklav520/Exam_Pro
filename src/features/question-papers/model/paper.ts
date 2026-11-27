import { nanoid } from '@reduxjs/toolkit';
import type { ExamSection, PracticalApp, PracticalTask } from '@/shared/types';

export type PaperStatus = 'draft' | 'under_review' | 'approved';

export interface McqItem {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  marks: number;
}

export const practicalApps = [
  'MS Word',
  'MS Excel',
  'MS PowerPoint',
] as const satisfies readonly PracticalApp[];
export type PracticalItem = PracticalTask;

/** The paper setter who prepares a set. */
export interface PaperSetter {
  id: string;
  name: string;
}

export interface PaperSet {
  id: string;
  name: string;
  exam: string;
  title: string;
  status: PaperStatus;
  mcqs: McqItem[];
  tasks: PracticalItem[];
  /** Null until first sent for approval. */
  submittedOn: string | null;
  updatedAt: string;
  /** Why the last review returned it. */
  remarks: string;
  /** Absent on sets saved before setters were tracked; every setter sees those. */
  setter?: PaperSetter;
  /** Set when the Admin assigned this set from an exam; it then stays with that exam. */
  examId?: string;
  /** Copy of the exam's pattern when assigned, so the setter knows what to prepare. */
  pattern?: ExamSection[];
  /** yyyy-mm-dd, or empty for no deadline. */
  dueDate?: string;
  assignedOn?: string;
}

/** A set the Admin assigned to a setter: same pattern as the exam, empty until prepared. */
export function createAssignedSet(input: {
  exam: { id: string; title: string; sections: ExamSection[] };
  name: string;
  setter: PaperSetter;
  dueDate: string;
}): PaperSet {
  const { exam, name, setter, dueDate } = input;
  return {
    ...createPaper(exam.title, name, setter),
    examId: exam.id,
    pattern: structuredClone(exam.sections),
    dueDate,
  };
}

/** Sets of an exam, matched by id when assigned, otherwise by title. */
export const isSetOfExam = (paper: PaperSet, exam: { id: string; title: string }) =>
  paper.examId === undefined ? paper.exam === exam.title : paper.examId === exam.id;

/** Each setter works on their own sets only. */
export const isOwnPaper = (paper: PaperSet, setterId: string) =>
  paper.setter === undefined || paper.setter.id === setterId;

const sumMarks = (items: { marks: number }[]) => items.reduce((sum, item) => sum + item.marks, 0);

export function getPaperTotals({ mcqs, tasks }: Pick<PaperSet, 'mcqs' | 'tasks'>) {
  const mcqMarks = sumMarks(mcqs);
  const taskMarks = sumMarks(tasks);
  return {
    mcqMarks,
    taskMarks,
    questions: mcqs.length + tasks.length,
    marks: mcqMarks + taskMarks,
  };
}

export const paperTypes = ['MCQ', 'Practical', 'MCQ + Practical'] as const;

export function getPaperType({ mcqs, tasks }: Pick<PaperSet, 'mcqs' | 'tasks'>) {
  if (mcqs.length > 0 && tasks.length === 0) return 'MCQ';
  if (tasks.length > 0 && mcqs.length === 0) return 'Practical';
  return 'MCQ + Practical';
}

/** What must be fixed before a set can be sent for approval. */
export function getPaperIssues(paper: PaperSet): string[] {
  const issues: string[] = [];
  if (paper.title.trim().length < 3) issues.push('Enter a paper title of at least 3 characters.');
  if (paper.mcqs.length + paper.tasks.length === 0) {
    issues.push('Add at least one question or practical task.');
  }
  return issues;
}

/** "Set 5" when the exam already has sets up to 4. */
export function getNextSetName(papers: PaperSet[], exam: string): string {
  const numbers = papers
    .filter((paper) => paper.exam === exam)
    .map((paper) => Number(/^Set (\d+)$/.exec(paper.name)?.[1] ?? 0));
  return `Set ${Math.max(0, ...numbers) + 1}`;
}

export function createPaper(exam: string, name: string, setter?: PaperSetter): PaperSet {
  return {
    ...(setter && { setter }),
    id: nanoid(),
    name,
    exam,
    title: `${exam.replace(/ Exam$/, '')} – ${name}`,
    status: 'draft',
    mcqs: [],
    tasks: [],
    submittedOn: null,
    updatedAt: formatStamp(new Date()),
    remarks: '',
  };
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 12 Mar 2026 */
export function formatDay(date: Date): string {
  return `${date.getDate()} ${months[date.getMonth()] ?? ''} ${date.getFullYear()}`;
}

/** 12 Mar 2026, 10:24 AM */
export function formatStamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  const hours = date.getHours();
  const time = `${pad(hours % 12 || 12)}:${pad(date.getMinutes())} ${hours < 12 ? 'AM' : 'PM'}`;
  return `${formatDay(date)}, ${time}`;
}
