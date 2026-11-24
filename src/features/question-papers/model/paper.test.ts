import { createPaper, formatStamp, getNextSetName, getPaperIssues, getPaperType } from './paper';

const mcq = { id: 'q', text: 'Q', options: ['a', 'b'], correctIndex: 0, marks: 1 };
const task = { id: 't', app: 'MS Word', title: 'T', instructions: 'I', marks: 20 } as const;

describe('paper', () => {
  it('numbers sets per exam', () => {
    const papers = [
      createPaper('A', 'Set 1'),
      createPaper('A', 'Set 4'),
      createPaper('B', 'Set 9'),
    ];
    expect(getNextSetName(papers, 'A')).toBe('Set 5');
    expect(getNextSetName(papers, 'C')).toBe('Set 1');
  });

  it('derives the paper type', () => {
    expect(getPaperType({ mcqs: [mcq], tasks: [] })).toBe('MCQ');
    expect(getPaperType({ mcqs: [], tasks: [task] })).toBe('Practical');
    expect(getPaperType({ mcqs: [mcq], tasks: [task] })).toBe('MCQ + Practical');
  });

  it('lists what blocks submission', () => {
    const paper = createPaper('A Exam', 'Set 1');
    expect(getPaperIssues(paper)).toHaveLength(1);
    expect(getPaperIssues({ ...paper, title: ' ', mcqs: [mcq] })).toHaveLength(1);
    expect(getPaperIssues({ ...paper, mcqs: [mcq] })).toEqual([]);
  });

  it('formats midnight and noon', () => {
    expect(formatStamp(new Date(2026, 2, 12, 0, 5))).toBe('12 Mar 2026, 12:05 AM');
    expect(formatStamp(new Date(2026, 2, 12, 12, 30))).toBe('12 Mar 2026, 12:30 PM');
  });
});
