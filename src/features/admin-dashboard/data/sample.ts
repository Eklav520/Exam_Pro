// Sample data matching the design. Replace with an API when connecting this screen.
export const dashboardStats = {
  totalExaminations: 12,
  pendingApprovals: 3,
  activeExaminations: 4,
  completed: 5,
  candidates: 2460,
  submissions: 1980,
  pendingEvaluation: 1250,
  awaitingFinalApproval: 4,
};

export const examinationStatus = [
  { label: 'Active', count: 4, color: '#008775' },
  { label: 'Completed', count: 5, color: '#3fb950' },
  { label: 'Upcoming', count: 2, color: '#5b7fd0' },
  { label: 'Draft', count: 1, color: '#c4cbd6' },
];

export type StepState = 'done' | 'current' | 'upcoming';

export const recentWorkflow: {
  examTitle: string;
  steps: { label: string; state: StepState }[];
} = {
  examTitle: 'MS Office Practical Examination',
  steps: [
    { label: 'Paper Set Created', state: 'done' },
    { label: 'Approved & Released', state: 'done' },
    { label: 'Exam Completed', state: 'done' },
    { label: 'Evaluation (60%)', state: 'current' },
    { label: 'Final Approval', state: 'upcoming' },
  ],
};

export const academicYears = ['2025 – 2026', '2024 – 2025'];
