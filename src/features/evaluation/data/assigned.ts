// Sample data. Replace with an API when connecting this screen.
export type ScriptStatus = 'pending' | 'evaluated' | 'sent';

/** An answer paper the Admin allocated to the signed-in evaluator. */
export interface AssignedScript {
  registrationNo: string;
  exam: string;
  paperSet: string;
  centre: string;
  assignedOn: string;
  maxMarks: number;
  /** Null until evaluated. */
  marks: number | null;
  status: ScriptStatus;
}

const script = (
  number: number,
  centre: string,
  marks: number | null,
  status: ScriptStatus,
): AssignedScript => ({
  registrationNo: `EXM2026${String(number).padStart(4, '0')}`,
  exam: 'APPSC Computer Proficiency Test',
  paperSet: 'Set 3',
  centre,
  assignedOn: '14 Mar 2026',
  maxMarks: 100,
  marks,
  status,
});

export const sampleScripts: AssignedScript[] = [
  script(1, 'Centre – A', null, 'pending'),
  script(4, 'Centre – A', null, 'pending'),
  script(7, 'Centre – A', null, 'pending'),
  script(9, 'Centre – B', 81, 'evaluated'),
  script(12, 'Centre – B', 67, 'evaluated'),
  script(15, 'Centre – B', 74, 'sent'),
  script(18, 'Centre – C', 90, 'sent'),
  script(21, 'Centre – C', 58, 'sent'),
];
