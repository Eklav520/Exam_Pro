// Sample data matching the design. Replace with an API when connecting these screens.
import type { McqItem, PaperSet, PaperSetter, PaperStatus, PracticalItem } from '../model/paper';

export const SAMPLE_EXAM = 'MS Office Practical Exam';
export const sampleExams = [SAMPLE_EXAM, 'Computer Fundamentals Exam'];

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

const priya: PaperSetter = { id: 'u-setter', name: 'Priya Sharma' };
const manoj: PaperSetter = { id: 'u-setter-2', name: 'Manoj Jain' };

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
  title: `MS Office Practical – Set ${number}`,
  status,
  mcqs,
  tasks,
  submittedOn: `${day} Mar 2026`,
  updatedAt: `${day} Mar 2026, ${time}`,
  remarks: '',
  setter,
});

export const samplePapers: PaperSet[] = [
  set(1, 'draft', 12, '10:24 AM', priya),
  set(2, 'under_review', 12, '11:18 AM', priya),
  set(3, 'approved', 11, '04:32 PM', manoj),
  set(4, 'draft', 10, '09:15 AM', priya),
];
