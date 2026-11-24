export type UserRole = 'student' | 'admin';

/** Responsibility of an admin-side user. */
export type StaffRole = 'admin' | 'question_paper_setter' | 'higher_official' | 'evaluator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** Only for admins. The backend does not send it yet. */
  staffRole?: StaffRole;
}
