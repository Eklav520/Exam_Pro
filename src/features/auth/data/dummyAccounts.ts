import type { StaffRole, User } from '@/shared/types';

/** Accounts of the in-browser mock API. They do not exist on a real server. */
export interface DummyAccount extends User {
  label: string;
  /** Where the sign-in OTP is "sent". */
  mobile: string;
}

export const DUMMY_PASSWORD = 'demo123';
/** Every sign-in OTP is this until an SMS gateway is connected. */
export const DUMMY_OTP = '123456';

const staff = (
  id: string,
  label: string,
  name: string,
  staffRole: StaffRole,
  mobile: string,
  email = `${id.replace('u-', '')}@exampro.test`,
): DummyAccount => ({
  id,
  label,
  name,
  mobile,
  email,
  role: 'admin',
  staffRole,
});

export const dummyAccounts: DummyAccount[] = [
  staff('u-admin', 'Admin', 'Alex Dsouza', 'admin', '9848012345'),
  staff(
    'u-setter',
    'Paper Setter – Priya Sharma',
    'Priya Sharma',
    'question_paper_setter',
    '9866023456',
  ),
  // Ids match the paper setters the Admin assigns sets to.
  staff(
    'u-setter-2',
    'Paper Setter – Manoj Jain',
    'Manoj Jain',
    'question_paper_setter',
    '9866023457',
    'manoj.jain@exampro.test',
  ),
  staff(
    'u-setter-4',
    'Paper Setter – Vikram Singh',
    'Vikram Singh',
    'question_paper_setter',
    '9866023458',
    'vikram.singh@exampro.test',
  ),
  staff('u-official', 'Higher Official', 'Hari Om', 'higher_official', '9440034567'),
  staff('u-evaluator', 'Evaluator', 'R. Kumar', 'evaluator', '9701045678'),
  {
    id: 'u-student',
    label: 'Student',
    name: 'Sam Student',
    email: 'student@exampro.test',
    role: 'student',
    mobile: '9959056789',
  },
];
