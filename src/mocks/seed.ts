import { DUMMY_PASSWORD, dummyAccounts } from '@/features/auth/data/dummyAccounts';
import type { Exam, Question, User } from '@/shared/types';

export interface MockUser extends User {
  password: string;
}

export const seedUsers: MockUser[] = dummyAccounts.map(
  ({ label: _label, mobile: _mobile, ...user }) => ({
    ...user,
    password: DUMMY_PASSWORD,
  }),
);

function question(
  id: string,
  text: string,
  options: string[],
  correct: number[],
  explanation: string,
  marks = 2,
): Question {
  const optionId = (index: number) => `${id}-o${index + 1}`;
  return {
    id,
    type: correct.length > 1 ? 'multiple' : 'single',
    text,
    options: options.map((optionText, index) => ({ id: optionId(index), text: optionText })),
    correctOptionIds: correct.map(optionId),
    marks,
    explanation,
  };
}

// APPSC (Andhra Pradesh Public Service Commission) examinations.
export const seedExams: Exam[] = [
  {
    id: 'group2-screening',
    title: 'APPSC Group-II Services – Screening Test',
    subject: 'General Studies & Mental Ability',
    description: 'History, geography and polity of India and Andhra Pradesh.',
    durationMinutes: 15,
    passPercentage: 50,
    negativeMarking: 0.25,
    status: 'published',
    tasks: [],
    questions: [
      question(
        'g2q1',
        'Andhra State was formed on 1 October 1953 with which city as its capital?',
        ['Hyderabad', 'Kurnool', 'Guntur', 'Visakhapatnam'],
        [1],
        'Kurnool was the capital of Andhra State until Andhra Pradesh was formed in 1956.',
      ),
      question(
        'g2q2',
        'Which of these rivers flow through Andhra Pradesh?',
        ['Godavari', 'Narmada', 'Krishna', 'Tapti'],
        [0, 2],
        'The Narmada and the Tapti flow west through central India into the Arabian Sea.',
      ),
      question(
        'g2q3',
        'Which Article of the Constitution of India provides for a Public Service Commission for each State?',
        ['Article 280', 'Article 324', 'Article 315', 'Article 352'],
        [2],
        'Article 315 provides for the UPSC and a Public Service Commission for each State.',
      ),
      question(
        'g2q4',
        'Who was the first Chief Minister of Andhra State?',
        ['N. Sanjiva Reddy', 'P. V. Narasimha Rao', 'N. T. Rama Rao', 'Tanguturi Prakasam'],
        [3],
        'Tanguturi Prakasam, known as Andhra Kesari, became Chief Minister in 1953.',
      ),
      question(
        'g2q5',
        'Which of these are districts of Andhra Pradesh?',
        ['Prakasam', 'Warangal', 'Anantapur', 'Nizamabad'],
        [0, 2],
        'Warangal and Nizamabad are in Telangana.',
      ),
    ],
  },
  {
    id: 'group1-prelims',
    title: 'APPSC Group-I Services – Preliminary (General Aptitude)',
    subject: 'General Aptitude',
    description: 'Percentages, averages, time and work, and the number system.',
    durationMinutes: 20,
    passPercentage: 60,
    negativeMarking: 0,
    status: 'published',
    tasks: [],
    questions: [
      question('g1q1', 'What is 15% of 240?', ['24', '30', '36', '40'], [2], '0.15 × 240 = 36.', 1),
      question(
        'g1q2',
        'The average of 8, 12, 16 and x is 14. What is x?',
        ['18', '20', '22', '24'],
        [1],
        'The sum must be 56, so x = 56 − 36 = 20.',
        1,
      ),
      question(
        'g1q3',
        'A finishes a job in 6 days and B in 12 days. How long do they take together?',
        ['3 days', '4 days', '5 days', '9 days'],
        [1],
        '1/6 + 1/12 = 1/4 of the job per day.',
        1,
      ),
      question(
        'g1q4',
        'Which of these numbers are prime?',
        ['51', '53', '57', '59'],
        [1, 3],
        '51 = 3 × 17 and 57 = 3 × 19.',
        1,
      ),
    ],
  },
  {
    id: 'panchayat-secretary',
    title: 'APPSC Panchayat Secretary (Grade-V) – Screening Test',
    subject: 'Rural Development & Panchayat Raj',
    description: 'Panchayat Raj institutions and rural development. Still being written.',
    durationMinutes: 25,
    passPercentage: 50,
    negativeMarking: 0,
    status: 'draft',
    tasks: [],
    questions: [
      question(
        'psq1',
        'In which year was the 73rd Constitutional Amendment on Panchayati Raj passed?',
        ['1990', '1992', '1996', '2001'],
        [1],
        'The 73rd Amendment Act, 1992 came into force on 24 April 1993.',
      ),
    ],
  },
];
