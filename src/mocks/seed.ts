import { DUMMY_PASSWORD, dummyAccounts } from '@/features/auth/data/dummyAccounts';
import type { Exam, Question, User } from '@/shared/types';

export interface MockUser extends User {
  password: string;
}

export const seedUsers: MockUser[] = dummyAccounts.map(({ label: _label, ...user }) => ({
  ...user,
  password: DUMMY_PASSWORD,
}));

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

export const seedExams: Exam[] = [
  {
    id: 'js-fundamentals',
    title: 'JavaScript Fundamentals',
    subject: 'Programming',
    description: 'Types, scope, closures and asynchronous code.',
    durationMinutes: 15,
    passPercentage: 50,
    negativeMarking: 0.25,
    status: 'published',
    questions: [
      question(
        'js1',
        'What does typeof null return?',
        ['"null"', '"object"', '"undefined"', '"number"'],
        [1],
        'A long-standing quirk of the language, kept for compatibility.',
      ),
      question(
        'js2',
        'Which of these values are falsy?',
        ['0', '"0"', 'NaN', '[]'],
        [0, 2],
        'Non-empty strings and all objects, including empty arrays, are truthy.',
      ),
      question(
        'js3',
        'Which keyword declares a block-scoped binding that cannot be reassigned?',
        ['var', 'let', 'const', 'static'],
        [2],
        'const prevents reassignment of the binding, not mutation of the value.',
      ),
      question(
        'js4',
        'Which promise combinator waits for every promise to settle and never rejects because of one?',
        ['Promise.all', 'Promise.race', 'Promise.any', 'Promise.allSettled'],
        [3],
        'Promise.allSettled reports each outcome as fulfilled or rejected.',
      ),
      question(
        'js5',
        'Which array methods return a new array without changing the original?',
        ['map', 'sort', 'filter', 'push'],
        [0, 2],
        'sort and push both modify the array in place.',
      ),
    ],
  },
  {
    id: 'quant-aptitude',
    title: 'Quantitative Aptitude',
    subject: 'Aptitude',
    description: 'Percentages, ratios, averages, and time and work.',
    durationMinutes: 20,
    passPercentage: 60,
    negativeMarking: 0,
    status: 'published',
    questions: [
      question('qa1', 'What is 15% of 240?', ['24', '30', '36', '40'], [2], '0.15 × 240 = 36.', 1),
      question(
        'qa2',
        'The average of 8, 12, 16 and x is 14. What is x?',
        ['18', '20', '22', '24'],
        [1],
        'The sum must be 56, so x = 56 − 36 = 20.',
        1,
      ),
      question(
        'qa3',
        'A finishes a job in 6 days and B in 12 days. How long do they take together?',
        ['3 days', '4 days', '5 days', '9 days'],
        [1],
        '1/6 + 1/12 = 1/4 of the job per day.',
        1,
      ),
      question(
        'qa4',
        'Which of these numbers are prime?',
        ['51', '53', '57', '59'],
        [1, 3],
        '51 = 3 × 17 and 57 = 3 × 19.',
        1,
      ),
    ],
  },
  {
    id: 'sql-basics',
    title: 'SQL Basics',
    subject: 'Databases',
    description: 'Joins, grouping and constraints. Still being written.',
    durationMinutes: 25,
    passPercentage: 50,
    negativeMarking: 0,
    status: 'draft',
    questions: [
      question(
        'sql1',
        'Which clause filters groups after aggregation?',
        ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'],
        [1],
        'WHERE filters rows before grouping; HAVING filters the groups.',
      ),
    ],
  },
];
