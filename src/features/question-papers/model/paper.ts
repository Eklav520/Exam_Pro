import { nanoid } from '@reduxjs/toolkit';

export type PaperStatus = 'draft' | 'under_review' | 'approved';

export interface McqItem {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  marks: number;
}

export const practicalApps = ['MS Word', 'MS Excel', 'MS PowerPoint'] as const;
export type PracticalApp = (typeof practicalApps)[number];

export interface PracticalItem {
  id: string;
  app: PracticalApp;
  title: string;
  instructions: string;
  marks: number;
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
}

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

export function createPaper(exam: string, name: string): PaperSet {
  return {
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
