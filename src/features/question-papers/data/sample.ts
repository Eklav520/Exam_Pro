// Sample data matching the design. Replace with an API when connecting these screens.
export type PaperStatus = 'draft' | 'under_review' | 'approved';

export interface PaperSet {
  id: string;
  name: string;
  exam: string;
  title: string;
  type: string;
  totalQuestions: number;
  totalMarks: number;
  status: PaperStatus;
  submittedOn: string;
  updatedAt: string;
}

export const SAMPLE_EXAM = 'MS Office Practical Exam';
export const sampleExams = [SAMPLE_EXAM, 'Computer Fundamentals Exam'];
export const paperTypes = ['MCQ', 'Practical', 'MCQ + Practical'];

const set = (number: number, status: PaperStatus, day: number, time: string): PaperSet => ({
  id: `set-${number}`,
  name: `Set ${number}`,
  exam: SAMPLE_EXAM,
  title: `MS Office Practical – Set ${number}`,
  type: 'MCQ + Practical',
  totalQuestions: 40,
  totalMarks: 100,
  status,
  submittedOn: `${day} Mar 2026`,
  updatedAt: `${day} Mar 2026, ${time}`,
});

export const paperSets: PaperSet[] = [
  set(1, 'draft', 12, '10:24 AM'),
  set(2, 'under_review', 12, '11:18 AM'),
  set(3, 'approved', 11, '04:32 PM'),
  set(4, 'draft', 10, '09:15 AM'),
];
