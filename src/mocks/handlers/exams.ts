import { http, HttpResponse } from 'msw';
import type { Exam, StudentExam } from '@/shared/types';
import { db } from '../db';
import { requireUser, required, toSummary, url } from './utils';

function toStudentExam(exam: Exam, userId: string): StudentExam {
  const active = db.attempts.find(
    (attempt) =>
      attempt.exam.id === exam.id &&
      attempt.userId === userId &&
      !attempt.result &&
      Date.now() < attempt.expiresAt,
  );
  return { ...toSummary(exam), activeAttemptId: active?.id ?? null };
}

const published = () => db.exams.filter((exam) => exam.status === 'published');

export const examHandlers = [
  http.get(url('/exams'), ({ request }) => {
    const user = requireUser(request, 'student');
    return HttpResponse.json(published().map((exam) => toStudentExam(exam, user.id)));
  }),

  http.get<{ id: string }>(url('/exams/:id'), ({ request, params }) => {
    const user = requireUser(request, 'student');
    const exam = required(
      published().find(({ id }) => id === params.id),
      'Exam',
    );
    return HttpResponse.json(toStudentExam(exam, user.id));
  }),
];
