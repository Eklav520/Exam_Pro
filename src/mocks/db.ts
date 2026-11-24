import type { AnswerMap, Exam, Result } from '@/shared/types';
import { gradeExam } from './grading';
import { seedExams, seedUsers, type MockUser } from './seed';

export interface MockAttempt {
  id: string;
  userId: string;
  /** Snapshot, so edits to the exam never affect a running or finished attempt. */
  exam: Exam;
  startedAt: number;
  expiresAt: number;
  answers: AnswerMap;
  revision: number;
  result: Result | null;
}

interface Database {
  users: MockUser[];
  exams: Exam[];
  attempts: MockAttempt[];
}

const STORAGE_KEY = 'exam-pro.mock-db';

const createSeed = (): Database =>
  structuredClone({ users: seedUsers, exams: seedExams, attempts: [] });

function load(): Database {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    // Accounts always come from the code, so adding one needs no data reset.
    return saved ? { ...(JSON.parse(saved) as Database), users: seedUsers } : createSeed();
  } catch {
    return createSeed();
  }
}

export let db = load();

/** Persisted so that reloading the page mid-exam behaves as it would with a real server. */
export function persistDb() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // In-memory only.
  }
}

export function resetDb() {
  db = createSeed();
  persistDb();
}

export function finalizeAttempt(attempt: MockAttempt): Result {
  attempt.result ??= {
    ...gradeExam(attempt.exam, attempt.answers),
    attemptId: attempt.id,
    submittedAt: new Date(Math.min(Date.now(), attempt.expiresAt)).toISOString(),
  };
  return attempt.result;
}

/** Closes attempts abandoned past their deadline, after allowing for a late auto-submit. */
export const SUBMIT_GRACE_MS = 10_000;

export function finalizeExpiredAttempts() {
  for (const attempt of db.attempts) {
    if (Date.now() > attempt.expiresAt + SUBMIT_GRACE_MS) finalizeAttempt(attempt);
  }
}
