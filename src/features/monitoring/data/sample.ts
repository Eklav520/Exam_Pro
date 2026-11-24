// Sample data matching the design. Replace with an API when connecting this screen.
export type CandidateStatus = 'submitted' | 'attended' | 'not_attended';

export interface MonitoredCandidate {
  registrationNo: string;
  name: string;
  centre: string;
  paperSet: string;
  status: CandidateStatus;
  submittedAt: string | null;
}

export const attendance = { allocated: 2460, attended: 2378, submitted: 2356 };

export const centres = ['Centre – A', 'Centre – B'];

export const SAMPLE_EXAM_DATE = '2026-03-12';

export const candidates: MonitoredCandidate[] = [
  {
    registrationNo: 'EXM20260001',
    name: 'Aarav Sharma',
    centre: 'Centre – A',
    paperSet: 'Set 3',
    status: 'submitted',
    submittedAt: '12 Mar 2026, 11:28 AM',
  },
  {
    registrationNo: 'EXM20260002',
    name: 'Diya Patel',
    centre: 'Centre – A',
    paperSet: 'Set 3',
    status: 'submitted',
    submittedAt: '12 Mar 2026, 11:30 AM',
  },
  {
    registrationNo: 'EXM20260003',
    name: 'Karan Mehta',
    centre: 'Centre – B',
    paperSet: 'Set 3',
    status: 'attended',
    submittedAt: null,
  },
];
