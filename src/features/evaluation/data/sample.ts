// Sample data matching the design. Replace with an API when connecting these screens.
export interface EvaluatorLoad {
  id: string;
  name: string;
  initials: string;
  avatarClass: string;
  allocated: number;
  completed: number;
}

export const submissionStats = { total: 2356, allocated: 1250 };

export const evaluators: EvaluatorLoad[] = [
  {
    id: 'rk',
    name: 'Dr. R. Kumar',
    initials: 'RK',
    avatarClass: 'bg-sky-200 text-sky-900',
    allocated: 300,
    completed: 180,
  },
  {
    id: 'sp',
    name: 'Ms. S. Priya',
    initials: 'SP',
    avatarClass: 'bg-red-200 text-red-900',
    allocated: 250,
    completed: 120,
  },
  {
    id: 'vk',
    name: 'Mr. V. Kumar',
    initials: 'VK',
    avatarClass: 'bg-amber-200 text-amber-900',
    allocated: 200,
    completed: 200,
  },
];

export const answerPaper = {
  exam: 'MS Office Practical Exam',
  registrationNo: 'EXM20260001',
  paperSet: 'Set 3',
  mcq: { questions: 20, score: 40, total: 40 },
};

export interface PracticalTask {
  id: string;
  label: string;
  maxMarks: number;
  pages: number;
}

export const practicalTasks: PracticalTask[] = [
  { id: 'word', label: 'Task 1 – Word', maxMarks: 20, pages: 3 },
  { id: 'excel', label: 'Task 2 – Excel', maxMarks: 20, pages: 1 },
  { id: 'ppt', label: 'Task 3 – PPT', maxMarks: 20, pages: 5 },
];

export interface TaskMark {
  marks: string;
  remarks: string;
}

export const initialMarks: Record<string, TaskMark> = {
  word: { marks: '18', remarks: 'Good formatting. Minor alignment issue in the table.' },
};

export type ResultStatus = 'finalized' | 'under_review' | 're_evaluation';

export interface CandidateResult {
  registrationNo: string;
  name: string;
  totalMarks: number;
  evaluatorMarks: number;
  finalMarks: number;
  status: ResultStatus;
  sections: { name: string; maxMarks: number; evaluatorMarks: number }[];
}

const result = (
  registrationNo: string,
  name: string,
  marks: { total: number; mcq: number; practical: number },
  status: ResultStatus,
): CandidateResult => ({
  registrationNo,
  name,
  totalMarks: marks.total,
  evaluatorMarks: marks.mcq + marks.practical,
  finalMarks: marks.mcq + marks.practical,
  status,
  sections: [
    { name: 'Section A – MCQ', maxMarks: 40, evaluatorMarks: marks.mcq },
    { name: 'Section B – Practical', maxMarks: 60, evaluatorMarks: marks.practical },
  ],
});

export const resultStats = { evaluated: 2356, underReview: 48, reEvaluation: 0 };

export const candidateResults: CandidateResult[] = [
  result('EXM20260001', 'Aarav Sharma', { total: 92, mcq: 40, practical: 52 }, 'finalized'),
  result('EXM20260002', 'Diya Patel', { total: 88, mcq: 38, practical: 50 }, 'finalized'),
  result('EXM20260003', 'Karan Mehta', { total: 76, mcq: 34, practical: 44 }, 'under_review'),
];
