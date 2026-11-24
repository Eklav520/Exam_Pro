import { http, HttpResponse } from 'msw';
import { db } from '../db';
import { fail, requireUser, url } from './utils';

export const authHandlers = [
  http.post<never, { email: string; password: string }>(url('/auth/login'), async ({ request }) => {
    const { email, password } = await request.json();
    const user = db.users.find(
      (candidate) =>
        candidate.email === email.trim().toLowerCase() && candidate.password === password,
    );
    if (!user) return fail(401, 'Incorrect email or password.');
    return HttpResponse.json({ token: `mock-${user.id}` });
  }),

  http.get(url('/auth/me'), ({ request }) => {
    const { id, name, email, role, staffRole } = requireUser(request);
    return HttpResponse.json({ id, name, email, role, staffRole });
  }),
];
