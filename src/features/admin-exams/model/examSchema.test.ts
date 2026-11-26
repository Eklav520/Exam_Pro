import { buildPreset } from './patternPresets';
import { createExamInput, examSchema } from './examSchema';

const validExam = () => ({ ...createExamInput(), title: 'Group-II', subject: 'General Studies' });
// Part A: 20 MCQs. Part B: Word, Excel and PowerPoint tasks.
const [mcqPart, practicalPart] = buildPreset('cpt');
const messages = (value: unknown) =>
  examSchema.safeParse(value).error?.issues.map((issue) => issue.message) ?? [];
const withGroup = (change: object) => ({
  ...mcqPart!,
  groups: [{ ...mcqPart!.groups[0]!, ...change }],
});

describe('examSchema', () => {
  it('allows a draft without sections but not a published exam', () => {
    expect(messages(validExam())).toEqual([]);
    expect(messages({ ...validExam(), status: 'published' })).toEqual([
      'Add at least one section before publishing',
    ]);
    expect(messages({ ...validExam(), status: 'published', sections: [mcqPart] })).toEqual([]);
  });

  it('accepts a section that mixes question types', () => {
    expect(practicalPart?.groups.map((group) => group.type)).toEqual([
      'ms_word',
      'ms_excel',
      'ms_powerpoint',
    ]);
    expect(messages({ ...validExam(), sections: [mcqPart, practicalPart] })).toEqual([]);
  });

  it('checks each section and question type', () => {
    expect(messages({ ...validExam(), sections: [{ ...mcqPart, name: ' ', groups: [] }] })).toEqual(
      ['Enter the part name', 'Add at least one question type'],
    );
    expect(messages({ ...validExam(), sections: [withGroup({ questionCount: 2.5 })] })).toEqual([
      'Use a whole number',
    ]);
  });

  it('keeps negative marks to objective questions, and below the marks', () => {
    const word = {
      ...practicalPart!,
      groups: [{ ...practicalPart!.groups[0]!, negativeMarks: 1 }],
    };
    expect(messages({ ...validExam(), sections: [word] })).toEqual([
      'Only objective questions can have negative marks',
    ]);
    expect(messages({ ...validExam(), sections: [withGroup({ negativeMarks: 3 })] })).toEqual([
      'Cannot be more than the marks per question',
    ]);
  });

  it('reports empty number inputs (NaN)', () => {
    expect(messages({ ...validExam(), durationMinutes: NaN })).toEqual(['Enter the duration']);
  });
});
