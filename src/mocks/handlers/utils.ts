import { HttpResponse } from 'msw';
import { env } from '@/shared/config/env';
import type { Exam, ExamSummary, UserRole } from '@/shared/types';
import { db, finalizeExpiredAttempts } from '../db';

export const url = (pathname: string) => `${env.apiBaseUrl}${pathname}`;

export const fail = (status: number, message: string) => HttpResponse.json({ message }, { status });

/** MSW treats a thrown Response as the mocked response. */
function abort(status: number, message: string): never {
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw fail(status, message);
}

export function requireUser(request: Request, role?: UserRole) {
  const token = request.headers.get('Authorization')?.replace('Bearer mock-', '');
  const user = db.users.find((candidate) => candidate.id === token);
  if (!user) return abort(401, 'Please sign in again.');
  if (role && user.role !== role) return abort(403, 'You do not have access to this.');
  finalizeExpiredAttempts();
  return user;
}

export function required<T>(value: T | undefined, name: string): T {
  return value ?? abort(404, `${name} not found.`);
}

export function toSummary(exam: Exam): ExamSummary {
  const { questions, tasks, ...rest } = exam;
  const items = [...questions, ...tasks];
  return {
    ...rest,
    questionCount: questions.length,
    taskCount: tasks.length,
    totalMarks: items.reduce((sum, item) => sum + item.marks, 0),
  };
}
