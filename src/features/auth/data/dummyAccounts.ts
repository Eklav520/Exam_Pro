import type { StaffRole, User } from '@/shared/types';

/** Accounts of the in-browser mock API. They do not exist on a real server. */
export interface DummyAccount extends User {
  label: string;
}

export const DUMMY_PASSWORD = 'demo123';

const staff = (id: string, label: string, name: string, staffRole: StaffRole): DummyAccount => ({
  id,
  label,
  name,
  email: `${id.replace('u-', '')}@exampro.test`,
  role: 'admin',
  staffRole,
});

export const dummyAccounts: DummyAccount[] = [
  staff('u-admin', 'Admin', 'Alex Dsouza', 'admin'),
  staff('u-official', 'Higher Official', 'Hari Om', 'higher_official'),
  staff('u-evaluator', 'Evaluator', 'R. Kumar', 'evaluator'),
  {
    id: 'u-student',
    label: 'Student',
    name: 'Sam Student',
    email: 'student@exampro.test',
    role: 'student',
  },
];
