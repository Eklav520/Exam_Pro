// Sample data matching the design. Replace with an API when connecting these screens.
import type { McqItem, PaperSet, PaperSetter, PaperStatus, PracticalItem } from '../model/paper';

export const SAMPLE_EXAM = 'APPSC Computer Proficiency Test';
export const sampleExams = [SAMPLE_EXAM, 'APPSC Group-II Services – Screening Test'];

const MCQ_MARKS = 2;
const TASK_MARKS = 20;

const questions: [text: string, options: string[], correctIndex: number][] = [
  [
    'Which of the following is the correct file extension for a Microsoft Word document?',
    ['.xls', '.docx', '.pptx', '.pdf'],
    1,
  ],
  [
    'In MS Word, which shortcut is used to save a document?',
    ['Ctrl + S', 'Ctrl + P', 'Ctrl + V', 'Ctrl + X'],
    0,
  ],
  ['The default file extension of Excel is', ['.docx', '.pptx', '.xlsx', '.txt'], 2],
  ['Which shortcut makes text bold?', ['Ctrl + I', 'Ctrl + U', 'Ctrl + B', 'Ctrl + E'], 2],
  ['Which tab contains the Table command in Word?', ['Home', 'Insert', 'Review', 'View'], 1],
  ['Which feature repeats text on every page?', ['Header', 'Margin', 'Column', 'Theme'], 0],
  [
    'Which feature creates letters for many recipients?',
    ['Macros', 'Styles', 'Mail Merge', 'Themes'],
    2,
  ],
  ['Every Excel formula begins with', ['+', '=', '#', '@'], 1],
  ['Which Excel function adds numbers?', ['COUNT', 'SUM', 'MAX', 'AVERAGE'], 1],
  ['Which function tests a condition?', ['IF', 'SUM', 'LEN', 'NOW'], 0],
  ['Which function returns the mean?', ['MIN', 'ROUND', 'AVERAGE', 'SUM'], 2],
  ['Which reference does not change when copied?', ['A1', '$A$1', 'A1:B2', 'Sheet1'], 1],
  ['Which feature shows only matching rows?', ['Sort', 'Filter', 'Freeze', 'Group'], 1],
  ['What does ##### in a cell usually mean?', ['Error', 'Empty', 'Column too narrow', 'Text'], 2],
  ['A single page of a presentation is a', ['Sheet', 'Slide', 'Frame', 'Card'], 1],
  ['Which key starts a slide show?', ['F1', 'F5', 'F7', 'F12'], 1],
  ['Which effect plays between slides?', ['Animation', 'Theme', 'Transition', 'Layout'], 2],
  ['Where is every slide formatted at once?', ['Slide Master', 'Notes', 'Outline', 'Handout'], 0],
  [
    'Which view shows all slides as small images?',
    ['Normal', 'Slide Sorter', 'Reading', 'Notes'],
    1,
  ],
  ['Which tab adds a picture to a slide?', ['Home', 'Design', 'Insert', 'Review'], 2],
];

const mcqs: McqItem[] = questions.map(([text, options, correctIndex], index) => ({
  id: `mcq-${index + 1}`,
  text,
  options,
  correctIndex,
  marks: MCQ_MARKS,
}));

const tasks: PracticalItem[] = [
  {
    id: 'task-1',
    app: 'MS Word',
    title: 'Report & Formatting',
    instructions: 'Create a formatted report with a table.',
    marks: TASK_MARKS,
  },
  {
    id: 'task-2',
    app: 'MS Excel',
    title: 'Calculation & Analysis',
    instructions: 'Prepare a mark sheet using formulas.',
    marks: TASK_MARKS,
  },
  {
    id: 'task-3',
    app: 'MS PowerPoint',
    title: 'Presentation',
    instructions: 'Design a five-slide presentation.',
    marks: TASK_MARKS,
  },
];

/** Staff with the Question Paper Setter role, who the Admin can assign sets to. */
export const paperSetters: PaperSetter[] = [
  { id: 'u-setter', name: 'Priya Sharma' },
  { id: 'u-setter-2', name: 'Manoj Jain' },
  { id: 'u-setter-3', name: 'Anita Desai' },
  { id: 'u-setter-4', name: 'Vikram Singh' },
  { id: 'u-setter-5', name: 'Lakshmi Pillai' },
  { id: 'u-setter-6', name: 'Rohan Das' },
  { id: 'u-setter-7', name: 'Sneha Kulkarni' },
  { id: 'u-setter-8', name: 'Divya Reddy' },
];

const [priya, manoj, anita, vikram] = paperSetters as [
  PaperSetter,
  PaperSetter,
  PaperSetter,
  PaperSetter,
];

/** The exam these sample sets belong to; see the mock seed. */
const SAMPLE_EXAM_ID = 'computer-proficiency-test';

// Each set of an exam goes to a different setter, so no one knows two papers.
const set = (
  number: number,
  status: PaperStatus,
  day: number,
  time: string,
  setter: PaperSetter,
): PaperSet => ({
  id: `set-${number}`,
  name: `Set ${number}`,
  exam: SAMPLE_EXAM,
  title: `Computer Proficiency Test – Set ${number}`,
  status,
  mcqs,
  tasks,
  // Drafts were never sent; the others were.
  submittedOn: status === 'draft' ? null : `${day} Mar 2026`,
  updatedAt: `${day} Mar 2026, ${time}`,
  remarks: '',
  setter,
  examId: SAMPLE_EXAM_ID,
  assignedOn: '2 Mar 2026',
  dueDate: '2026-03-10',
});

export const samplePapers: PaperSet[] = [
  set(1, 'draft', 12, '10:24 AM', priya),
  set(2, 'under_review', 12, '11:18 AM', manoj),
  set(3, 'approved', 11, '04:32 PM', anita),
  set(4, 'draft', 10, '09:15 AM', vikram),
  // Assigned to Priya, not started yet.
  {
    id: 'g2-set-1',
    name: 'Set 1',
    exam: 'APPSC Group-II Services – Screening Test',
    title: 'APPSC Group-II Services – Screening Test – Set 1',
    status: 'draft',
    mcqs: [],
    tasks: [],
    submittedOn: null,
    updatedAt: '20 Nov 2026, 10:00 AM',
    remarks: '',
    setter: priya,
    examId: 'group2-screening',
    assignedOn: '20 Nov 2026',
    dueDate: '2026-12-15',
  },
];
