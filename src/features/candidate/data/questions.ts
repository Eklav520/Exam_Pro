// Sample questions. No answer key: it must never reach a candidate's browser.
export interface McqQuestion {
  text: string;
  options: string[];
}

const q = (text: string, ...options: string[]): McqQuestion => ({ text, options });

export const questions: McqQuestion[] = [
  q(
    'Which program is used to create a word-processed document?',
    'Excel',
    'Word',
    'PowerPoint',
    'Access',
  ),
  q('Which shortcut saves the current document?', 'Ctrl + S', 'Ctrl + P', 'Ctrl + V', 'Ctrl + X'),
  q(
    'Which Word feature repeats text at the top of every page?',
    'Footer',
    'Header',
    'Margin',
    'Column',
  ),
  q('Which shortcut makes the selected text bold?', 'Ctrl + I', 'Ctrl + U', 'Ctrl + B', 'Ctrl + E'),
  q('Which tab contains the Table command in Word?', 'Home', 'Insert', 'Review', 'View'),
  q(
    'Which Word feature creates letters for many recipients?',
    'Mail Merge',
    'Macros',
    'Styles',
    'Themes',
  ),
  q(
    'What is the intersection of a row and a column in Excel called?',
    'Range',
    'Sheet',
    'Cell',
    'Table',
  ),
  q('Every Excel formula begins with which symbol?', '+', '=', '#', '@'),
  q('Which Excel function adds numbers?', 'COUNT', 'SUM', 'MAX', 'AVERAGE'),
  q('Which Excel function returns the mean of a range?', 'AVERAGE', 'SUM', 'MIN', 'ROUND'),
  q('Which function tests a condition?', 'IF', 'SUM', 'LEN', 'NOW'),
  q(
    'Which of the following is the correct file extension for a Microsoft Word document?',
    '.xls',
    '.docx',
    '.pptx',
    '.pdf',
  ),
  q(
    'Which chart compares values across categories?',
    'Column chart',
    'Pie chart',
    'Scatter chart',
    'Radar chart',
  ),
  q(
    'Which feature colours cells based on their values?',
    'Cell Styles',
    'Conditional Formatting',
    'Themes',
    'Borders',
  ),
  q('What is a single page of a presentation called?', 'Sheet', 'Slide', 'Frame', 'Card'),
  q('What is the file extension of a PowerPoint presentation?', '.pptx', '.xlsx', '.docx', '.csv'),
  q('Which key starts a slide show from the beginning?', 'F1', 'F5', 'F7', 'F12'),
  q('Which effect plays when moving between slides?', 'Animation', 'Transition', 'Theme', 'Layout'),
  q(
    'Where are formatting changes for every slide made?',
    'Slide Master',
    'Notes',
    'Outline',
    'Handout',
  ),
  q('Which tab is used to add a picture to a slide?', 'Home', 'Insert', 'Design', 'Review'),
];
