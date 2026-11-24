// Sample exam matching the design. Replace with an API when connecting these screens.
export const candidate = {
  rollNo: 'EXM20260078',
  exam: 'MS Office Practical Exam',
  centre: 'Centre - A',
};

export const EXAM_DURATION_MS = 150 * 60_000;
export const TOTAL_MARKS = 100;

export const sectionA = { title: 'Section A – MCQ', questionCount: 20, marks: 40 };
export const sectionB = { title: 'Section B – Practical', marks: 60 };

export const taskIds = ['word', 'excel', 'powerpoint'] as const;
export type TaskId = (typeof taskIds)[number];

export interface PracticalTask {
  id: TaskId;
  code: string;
  app: string;
  shortApp: string;
  title: string;
  marks: number;
  inputFile: string;
  intro: string;
  steps: { text: string; detail: string }[];
}

export const tasks: Record<TaskId, PracticalTask> = {
  word: {
    id: 'word',
    code: 'B1',
    app: 'MS Word',
    shortApp: 'Word',
    title: 'Report & Formatting',
    marks: 20,
    inputFile: 'Report_Draft.docx',
    intro: 'Perform the following in the given Word file:',
    steps: [
      { text: 'Add a title and two headings', detail: 'using styles. (6 Marks)' },
      { text: 'Write an introduction', detail: 'of at least three sentences. (6 Marks)' },
      { text: 'Insert a table', detail: 'with student details. (4 Marks)' },
      { text: 'Add a header and page numbers', detail: 'to every page. (4 Marks)' },
    ],
  },
  excel: {
    id: 'excel',
    code: 'B2',
    app: 'MS Excel',
    shortApp: 'Excel',
    title: 'Calculation & Analysis',
    marks: 20,
    inputFile: 'Student_Data.xlsx',
    intro: 'Perform the following in the given Excel file:',
    steps: [
      { text: 'Calculate Total, Average and Percentage', detail: 'for each student. (6 Marks)' },
      { text: 'Use IF formula to assign Grade', detail: 'based on Percentage. (6 Marks)' },
      {
        text: 'Create a Column Chart',
        detail: 'showing the Total Marks of all students. (4 Marks)',
      },
      { text: 'Apply suitable formatting', detail: 'and cell styles. (4 Marks)' },
    ],
  },
  powerpoint: {
    id: 'powerpoint',
    code: 'B3',
    app: 'MS PowerPoint',
    shortApp: 'PPT',
    title: 'Presentation',
    marks: 20,
    inputFile: 'Topic_Notes.pptx',
    intro: 'Perform the following in the given PowerPoint file:',
    steps: [
      { text: 'Create a title slide', detail: 'with the topic and your name. (5 Marks)' },
      { text: 'Add three content slides', detail: 'with bullet points. (6 Marks)' },
      { text: 'Apply a theme and transitions', detail: 'to all slides. (5 Marks)' },
      { text: 'Add a closing slide', detail: 'with a summary. (4 Marks)' },
    ],
  },
};

export const isTaskId = (value: string | undefined): value is TaskId =>
  taskIds.some((id) => id === value);

export const marksSheet = {
  title: 'Student Marks Sheet',
  headers: [
    'S. No.',
    'Student Name',
    'Maths',
    'Science',
    'English',
    'Total',
    'Average',
    'Percentage',
    'Grade',
  ],
  rows: [
    ['1', 'Aarav Sharma', '78', '85', '80'],
    ['2', 'Diya Patel', '92', '88', '91'],
    ['3', 'Karan Mehta', '65', '70', '72'],
    ['4', 'Neha Verma', '88', '90', '86'],
  ],
};
