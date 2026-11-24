import { nanoid } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import type { AnswersPayload, Attempt, PublicQuestion, Question } from '@/shared/types';
import { db, finalizeAttempt, persistDb, SUBMIT_GRACE_MS, type MockAttempt } from '../db';
import { fail, requireUser, required, url } from './utils';

const hideAnswerKey = ({ id, type, text, options, marks }: Question): PublicQuestion => ({
  id,
  type,
  text,
  options,
  marks,
});

const toAttempt = (attempt: MockAttempt): Attempt => ({
  id: attempt.id,
  examId: attempt.exam.id,
  examTitle: attempt.exam.title,
  status: attempt.result ? 'submitted' : 'in_progress',
  startedAt: new Date(attempt.startedAt).toISOString(),
  expiresAt: new Date(attempt.expiresAt).toISOString(),
  serverTime: new Date().toISOString(),
  questions: attempt.exam.questions.map(hideAnswerKey),
  answers: attempt.answers,
  revision: attempt.revision,
});

function findAttempt(request: Request, id: string): MockAttempt {
  const user = requireUser(request, 'student');
  return required(
    db.attempts.find((attempt) => attempt.id === id && attempt.userId === user.id),
    'Attempt',
  );
}

function applyAnswers(attempt: MockAttempt, { answers, revision }: AnswersPayload) {
  if (revision <= attempt.revision) return;
  attempt.answers = answers;
  attempt.revision = revision;
}

const acceptsAnswers = (attempt: MockAttempt) =>
  !attempt.result && Date.now() <= attempt.expiresAt + SUBMIT_GRACE_MS;

export const attemptHandlers = [
  http.post<{ id: string }>(url('/exams/:id/attempts'), ({ request, params }) => {
    const user = requireUser(request, 'student');
    const exam = required(
      db.exams.find(({ id, status }) => id === params.id && status === 'published'),
      'Exam',
    );
    let attempt = db.attempts.find(
      (candidate) =>
        candidate.exam.id === exam.id && candidate.userId === user.id && !candidate.result,
    );
    if (attempt && Date.now() >= attempt.expiresAt) {
      finalizeAttempt(attempt);
      attempt = undefined;
    }
    if (!attempt) {
      const now = Date.now();
      attempt = {
        id: nanoid(),
        userId: user.id,
        exam: structuredClone(exam),
        startedAt: now,
        expiresAt: now + exam.durationMinutes * 60_000,
        answers: {},
        revision: 0,
        result: null,
      };
      db.attempts.push(attempt);
    }
    persistDb();
    return HttpResponse.json(toAttempt(attempt));
  }),

  http.get<{ id: string }>(url('/attempts/:id'), ({ request, params }) => {
    const attempt = findAttempt(request, params.id);
    return HttpResponse.json(toAttempt(attempt));
  }),

  http.put<{ id: string }, AnswersPayload>(
    url('/attempts/:id/answers'),
    async ({ request, params }) => {
      const attempt = findAttempt(request, params.id);
      const payload = await request.json();
      if (!acceptsAnswers(attempt)) return fail(409, 'This exam has already ended.');
      applyAnswers(attempt, payload);
      persistDb();
      return HttpResponse.json({ revision: attempt.revision });
    },
  ),

  http.post<{ id: string }, AnswersPayload>(
    url('/attempts/:id/submit'),
    async ({ request, params }) => {
      const attempt = findAttempt(request, params.id);
      const payload = await request.json();
      if (acceptsAnswers(attempt)) applyAnswers(attempt, payload);
      finalizeAttempt(attempt);
      persistDb();
      return HttpResponse.json({ attemptId: attempt.id });
    },
  ),

  http.get(url('/results'), ({ request }) => {
    const user = requireUser(request, 'student');
    const results = db.attempts
      .filter((attempt) => attempt.userId === user.id)
      .flatMap((attempt) => attempt.result ?? [])
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
      .map(({ review: _review, ...summary }) => summary);
    return HttpResponse.json(results);
  }),

  http.get<{ id: string }>(url('/results/:id'), ({ request, params }) => {
    const attempt = findAttempt(request, params.id);
    return HttpResponse.json(required(attempt.result ?? undefined, 'Result'));
  }),
];
