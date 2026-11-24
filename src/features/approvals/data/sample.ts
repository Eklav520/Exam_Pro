// Sample data matching the design. Replace with an API when connecting this screen.
export const sectionA = {
  label: 'Section A – MCQ (20 Questions, 40 Marks)',
  questions: [
    {
      text: 'Which of the following is the correct file extension for a Microsoft Word document?',
      options: ['.xls', '.docx', '.pptx', '.pdf'],
      correctIndex: 1,
    },
    {
      text: 'Which Excel function adds a range of cells?',
      options: ['COUNT', 'AVERAGE', 'SUM', 'MAX'],
      correctIndex: 2,
    },
  ],
};

export const sectionB = {
  label: 'Section B – Practical (3 Tasks, 60 Marks)',
  tasks: [
    { title: 'Task 1 – Word', marks: 20, text: 'Create a formatted report with a table.' },
    { title: 'Task 2 – Excel', marks: 20, text: 'Prepare a mark sheet using formulas.' },
    { title: 'Task 3 – PPT', marks: 20, text: 'Design a five-slide presentation.' },
  ],
};
