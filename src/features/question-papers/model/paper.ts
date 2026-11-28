import { nanoid } from '@reduxjs/toolkit';
import { isObjective, sectionTypes } from '@/shared/lib/examPattern';
import type {
  ExamSection,
  PracticalApp,
  PracticalTask,
  QuestionGroup,
  SectionType,
} from '@/shared/types';

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

/** A pair of "Match the Following"; the right side is listed shuffled to candidates. */
export interface MatchPair {
  left: string;
  right: string;
}

/**
 * A question written for one slot of the exam's pattern. Its marks come from the pattern.
 * Which fields are used depends on the type.
 */
export interface PatternQuestion {
  id: string;
  /** The pattern group this fills. */
  groupId: string;
  type: SectionType;
  /** The question, the statement, the sentence with a blank, or the practical task title. */
  text: string;
  /** MCQ choices. */
  options?: string[];
  correctIndex?: number;
  /** "True"/"False", the missing word(s), or a model answer for written questions. */
  answer?: string;
  pairs?: MatchPair[];
  /** What the candidate must do in a practical task. */
  instructions?: string;
}

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
  /** Questions written for the pattern, when the set has one. */
  questions?: PatternQuestion[];
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

type QuestionFields = Pick<PaperSet, 'mcqs' | 'tasks' | 'questions' | 'pattern'>;

/** A set prepared against the exam's pattern, rather than free MCQs and tasks. */
export const usesPattern = (paper: Pick<PaperSet, 'pattern'>) => (paper.pattern ?? []).length > 0;

/** One slot of the pattern with the questions written for it so far. */
export interface GroupProgress {
  section: ExamSection;
  group: QuestionGroup;
  questions: PatternQuestion[];
  /** Questions still to write; never below 0. */
  missing: number;
}

export function getPatternProgress(paper: Pick<PaperSet, 'questions' | 'pattern'>) {
  const questions = paper.questions ?? [];
  return (paper.pattern ?? []).flatMap((section) =>
    section.groups.map((group): GroupProgress => {
      const written = questions.filter((question) => question.groupId === group.id);
      return {
        section,
        group,
        questions: written,
        missing: Math.max(0, group.questionCount - written.length),
      };
    }),
  );
}

/** Questions and tasks written, whatever kind of set. */
export const countItems = (paper: Pick<PaperSet, 'mcqs' | 'tasks' | 'questions'>) =>
  paper.mcqs.length + paper.tasks.length + (paper.questions ?? []).length;

export function getPaperTotals(paper: QuestionFields) {
  if (usesPattern(paper)) {
    const progress = getPatternProgress(paper);
    const marksOf = (rows: GroupProgress[]) =>
      rows.reduce((sum, row) => sum + row.questions.length * (row.group.marksPerQuestion || 0), 0);
    const isPractical = (row: GroupProgress) => sectionTypes[row.group.type].group === 'Practical';
    return {
      mcqMarks: marksOf(progress.filter((row) => !isPractical(row))),
      taskMarks: marksOf(progress.filter(isPractical)),
      questions: progress.reduce((sum, row) => sum + row.questions.length, 0),
      marks: marksOf(progress),
    };
  }
  const { mcqs, tasks } = paper;
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

export function getPaperType(paper: Pick<PaperSet, 'mcqs' | 'tasks' | 'pattern'>) {
  if (usesPattern(paper)) {
    const types = (paper.pattern ?? []).flatMap((section) => section.groups.map((g) => g.type));
    const practical = types.filter((type) => sectionTypes[type].group === 'Practical').length;
    if (practical === 0) return 'MCQ';
    return practical === types.length ? 'Practical' : 'MCQ + Practical';
  }
  const { mcqs, tasks } = paper;
  if (mcqs.length > 0 && tasks.length === 0) return 'MCQ';
  if (tasks.length > 0 && mcqs.length === 0) return 'Practical';
  return 'MCQ + Practical';
}

/** "Part A: add 3 more Multiple Choice (MCQ) questions." */
function describeMissing({ section, group, missing }: GroupProgress) {
  const word = sectionTypes[group.type].group === 'Practical' ? 'task' : 'question';
  return `${section.name}: add ${missing} more ${sectionTypes[group.type].label} ${word}${missing === 1 ? '' : 's'}.`;
}

/** What must be fixed before a set can be sent for approval. */
export function getPaperIssues(paper: PaperSet): string[] {
  const issues: string[] = [];
  if (paper.title.trim().length < 3) issues.push('Enter a paper title of at least 3 characters.');
  if (usesPattern(paper)) {
    // The set must match the exam's pattern exactly.
    for (const row of getPatternProgress(paper)) {
      if (row.missing > 0) issues.push(describeMissing(row));
    }
  } else if (countItems(paper) === 0) {
    issues.push('Add at least one question or practical task.');
  }
  return issues;
}

/** Marks a question of this group is worth, for display. */
export const marksEach = (group: QuestionGroup) =>
  `${group.marksPerQuestion} ${group.marksPerQuestion === 1 ? 'mark' : 'marks'} each${
    isObjective(group.type) && group.negativeMarks > 0 ? `, −${group.negativeMarks} if wrong` : ''
  }`;

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
