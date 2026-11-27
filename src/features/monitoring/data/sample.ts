// Sample data matching the design. Replace with an API when connecting this screen.
export type CandidateStatus = 'registered' | 'submitted' | 'attended' | 'not_attended';

/**
 * A candidate registered for the exam, with the centres they asked for in order of
 * preference, and the centre and computer the Admin mapped them to.
 */
export interface MonitoredCandidate {
  registrationNo: string;
  name: string;
  mobile: string;
  email: string;
  /** Centre ids, first choice first. Two or three. */
  preferences: string[];
  /** Null until mapped. */
  centreId: string | null;
  systemId: string | null;
  paperSet: string;
  status: CandidateStatus;
  submittedAt: string | null;
}

export const attendance = { allocated: 2460, attended: 2378, submitted: 2356 };

export const SAMPLE_EXAM_DATE = '2026-03-12';

const id = (letter: string) => `cen-${letter.toLowerCase()}`;
const pc = (letter: string, number: number) =>
  `CEN-${letter}-PC-${String(number).padStart(2, '0')}`;

const candidate = (
  number: number,
  name: string,
  preferences: string,
  seat: [centre: string, pc: number] | null,
  status: CandidateStatus,
  submittedAt: string | null = null,
): MonitoredCandidate => {
  const login = name.toLowerCase().replace(/[^a-z]+/g, '.');
  return {
    registrationNo: `EXM2026${String(number).padStart(4, '0')}`,
    name,
    mobile: `98480${String(10000 + number * 37).slice(-5)}`,
    email: `${login}@example.in`,
    preferences: [...preferences].map(id),
    centreId: seat ? id(seat[0]) : null,
    systemId: seat ? pc(...seat) : null,
    paperSet: 'Set 3',
    status,
    submittedAt,
  };
};

export const sampleCandidates: MonitoredCandidate[] = [
  candidate(1, 'Aarav Sharma', 'ABC', ['A', 4], 'attended'),
  candidate(2, 'Diya Patel', 'AB', ['A', 6], 'submitted', '12 Mar 2026, 11:30 AM'),
  candidate(3, 'Karan Mehta', 'AE', ['A', 5], 'not_attended'),
  candidate(4, 'Sai Kiran Reddy', 'BAF', ['B', 1], 'attended'),
  candidate(5, 'Lakshmi Prasanna', 'BA', ['B', 11], 'attended'),
  candidate(6, 'Venkata Ramana', 'BF', ['B', 9], 'submitted', '12 Mar 2026, 11:28 AM'),
  candidate(7, 'Harika Naidu', 'CD', ['C', 2], 'attended'),
  candidate(8, 'Pavan Kalyan', 'CDA', ['C', 7], 'attended'),
  candidate(9, 'Sravani Devi', 'DC', ['D', 8], 'attended'),
  candidate(10, 'Mahesh Babu K', 'DCE', ['D', 12], 'submitted', '12 Mar 2026, 11:41 AM'),
  candidate(11, 'Anjali Varma', 'EG', ['E', 9], 'not_attended'),
  candidate(12, 'Ravi Teja', 'FB', ['F', 19], 'attended'),
  candidate(13, 'Keerthi Suresh', 'GE', ['G', 4], 'attended'),
  candidate(14, 'Nikhil Rao', 'HA', ['H', 1], 'attended'),
  // Registered, still to be given a seat.
  candidate(15, 'Bhavana Reddy', 'ABC', null, 'registered'),
  candidate(16, 'Suresh Babu', 'DC', null, 'registered'),
  candidate(17, 'Madhavi Latha', 'EG', null, 'registered'),
  candidate(18, 'Naveen Kumar', 'HAB', null, 'registered'),
  candidate(19, 'Pooja Hegde', 'FB', null, 'registered'),
  candidate(20, 'Arjun Das', 'GE', null, 'registered'),
];
