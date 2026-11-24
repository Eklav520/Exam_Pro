// Sample data matching the design. Replace with an API when connecting this screen.
import { roles, type RoleId } from '../model/roles';
import { ALL_CENTRES, type ManagedUser } from '../model/userSchema';

export const centres = ['Centre - A', 'Centre - B'];

const user = (
  id: number,
  name: string,
  email: string,
  role: RoleId,
  lastLogin: string | null,
  status: ManagedUser['status'] = 'active',
): ManagedUser => ({
  id: `user-${id}`,
  name,
  email: `${email}@exampro.in`,
  role,
  mobile: '',
  centre: ALL_CENTRES,
  status,
  lastLogin,
});

const listed: ManagedUser[] = [
  user(1, 'Ravi Kumar', 'ravi.kumar', 'admin', '12 Mar 2026, 10:24 AM'),
  user(2, 'Priya Sharma', 'priya.sharma', 'question_paper_setter', '12 Mar 2026, 09:18 AM'),
  user(3, 'Manoj Jain', 'manoj.jain', 'question_paper_setter', '11 Mar 2026, 05:32 PM'),
  user(4, 'Dr. Hema Gupta', 'hema.gupta', 'higher_official', '12 Mar 2026, 11:06 AM'),
  user(5, 'Suresh Nair', 'suresh.nair', 'evaluator', '11 Mar 2026, 04:45 PM'),
  user(6, 'Meena Iyer', 'meena.iyer', 'evaluator', '11 Mar 2026, 04:10 PM'),
  user(7, 'Prof. K. Ramesh', 'ramesh.k', 'higher_official', '10 Mar 2026, 03:20 PM'),
  user(8, 'Anita Desai', 'anita.desai', 'question_paper_setter', '10 Mar 2026, 10:05 AM'),
];

// The rest of the 44 users on the summary cards.
const others: [RoleId, string[]][] = [
  ['admin', ['Kavya Rao', 'Arjun Menon', 'Neha Kapoor']],
  [
    'question_paper_setter',
    [
      'Vikram Singh',
      'Lakshmi Pillai',
      'Rohan Das',
      'Sneha Kulkarni',
      'Imran Khan',
      'Divya Reddy',
      'Nitin Joshi',
      'Pooja Bhat',
      'Sanjay Verma',
    ],
  ],
  ['higher_official', ['Dr. Anil Mathur']],
  [
    'evaluator',
    [
      'Ramya Krishnan',
      'Deepak Chawla',
      'Asha Thomas',
      'Gopal Shetty',
      'Farah Ali',
      'Harish Gowda',
      'Isha Malhotra',
      'Jatin Arora',
      'Keerthi Varma',
      'Latha Srinivas',
      'Mohan Prasad',
      'Nisha George',
      'Omkar Patil',
      'Preeti Saxena',
      'Rajesh Naidu',
      'Sunita Yadav',
      'Tarun Bose',
      'Uma Devi',
      'Varun Sethi',
      'Wasim Ahmed',
      'Yamini Raj',
      'Zoya Mirza',
      'Bharat Solanki',
    ],
  ],
];

const toLogin = (name: string) =>
  name
    .toLowerCase()
    .replace(/^(dr|prof)\. /, '')
    .replaceAll(' ', '.');

export const sampleUsers: ManagedUser[] = [
  ...listed,
  ...others
    .flatMap(([role, names]) => names.map((name) => ({ role, name })))
    .map(({ role, name }, index) =>
      user(
        listed.length + index + 1,
        name,
        toLogin(name),
        role,
        index % 9 === 8 ? null : `${9 - (index % 8)} Mar 2026, 10:${10 + index} AM`,
        index % 9 === 8 ? 'inactive' : 'active',
      ),
    ),
];

export const permissionModules = [
  'Dashboard',
  'Examinations',
  'Question Papers',
  'Approvals',
  'Conduct & Monitoring',
  'Evaluation',
  'Results',
  'Users & Roles',
  'Reports',
  'Settings',
];

/** A starting point to review, not an agreed policy. */
export const draftPermissions: Record<RoleId, string[]> = {
  admin: permissionModules,
  question_paper_setter: ['Dashboard', 'Question Papers'],
  higher_official: ['Dashboard', 'Approvals', 'Results', 'Reports'],
  evaluator: ['Dashboard', 'Evaluation'],
};

export interface AccessLog {
  id: string;
  time: string;
  user: string;
  role: string;
  activity: string;
  wasSuccessful: boolean;
}

const log = (
  id: number,
  time: string,
  name: string,
  role: RoleId,
  activity: string,
  wasSuccessful = true,
): AccessLog => ({
  id: `log-${id}`,
  time,
  user: name,
  role: roles[role].label,
  activity,
  wasSuccessful,
});

export const accessLogs: AccessLog[] = [
  log(1, '12 Mar 2026, 11:06 AM', 'Dr. Hema Gupta', 'higher_official', 'Signed in'),
  log(2, '12 Mar 2026, 10:41 AM', 'Suresh Nair', 'evaluator', 'Sign-in attempt', false),
  log(3, '12 Mar 2026, 10:24 AM', 'Ravi Kumar', 'admin', 'Signed in'),
  log(4, '12 Mar 2026, 09:18 AM', 'Priya Sharma', 'question_paper_setter', 'Signed in'),
  log(5, '11 Mar 2026, 06:02 PM', 'Manoj Jain', 'question_paper_setter', 'Signed out'),
  log(6, '11 Mar 2026, 05:32 PM', 'Manoj Jain', 'question_paper_setter', 'Signed in'),
];
