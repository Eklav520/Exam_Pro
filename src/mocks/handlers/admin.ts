import { nanoid } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import type { Exam, ExamInput } from '@/shared/types';
import { db, persistDb } from '../db';
import { requireUser, required, toSummary, url } from './utils';

function findExam(request: Request, examId: string): Exam {
  requireUser(request, 'admin');
  return required(
    db.exams.find(({ id }) => id === examId),
    'Exam',
  );
}

export const adminHandlers = [
  http.get(url('/admin/exams'), ({ request }) => {
    requireUser(request, 'admin');
    return HttpResponse.json(db.exams.map(toSummary));
  }),

  http.get<{ id: string }>(url('/admin/exams/:id'), ({ request, params }) =>
    HttpResponse.json(findExam(request, params.id)),
  ),

  http.post<never, ExamInput>(url('/admin/exams'), async ({ request }) => {
    requireUser(request, 'admin');
    const exam: Exam = { ...(await request.json()), id: nanoid() };
    db.exams.push(exam);
    persistDb();
    return HttpResponse.json(exam, { status: 201 });
  }),

  http.put<{ id: string }, ExamInput>(url('/admin/exams/:id'), async ({ request, params }) => {
    const exam = findExam(request, params.id);
    Object.assign(exam, await request.json(), { id: exam.id });
    persistDb();
    return HttpResponse.json(exam);
  }),

  http.delete<{ id: string }>(url('/admin/exams/:id'), ({ request, params }) => {
    const exam = findExam(request, params.id);
    db.exams.splice(db.exams.indexOf(exam), 1);
    persistDb();
    return new HttpResponse(null, { status: 204 });
  }),
];
