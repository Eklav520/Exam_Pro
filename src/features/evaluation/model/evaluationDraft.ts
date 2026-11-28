import type { TaskMark } from '../data/sample';

// Bump the version when the draft changes shape.
const STORAGE_KEY = 'exam-pro.evaluation-drafts.v1';

/** Marks entered so far on one answer paper, kept so the evaluator can take a break. */
export interface EvaluationDraft {
  marks: Record<string, TaskMark>;
  /** The task to reopen. */
  taskId: string;
  /** "10:24 AM" */
  savedAt: string;
}

type Drafts = Record<string, EvaluationDraft>;

function readAll(): Drafts {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Drafts;
  } catch {
    return {};
  }
}

/** Stands in for the server until evaluation is connected; this browser only. */
export const loadDraft = (registrationNo: string): EvaluationDraft | undefined =>
  readAll()[registrationNo];

export function saveDraft(registrationNo: string, draft: EvaluationDraft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readAll(), [registrationNo]: draft }));
  } catch {
    // Kept on screen only.
  }
}
