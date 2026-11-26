import { nanoid } from '@reduxjs/toolkit';
import type { ExamSection, QuestionGroup, SectionType } from '@/shared/types';
import { partName, sectionTypes, type SectionGroup } from './sectionTypes';

type Group = [type: SectionType, count: number, marks: number, negative?: number];
type Section = [title: string, groups: Group[]];

/** Common APPSC patterns to start from. Everything stays editable afterwards. */
const presets: { id: string; label: string; sections: Section[] }[] = [
  {
    id: 'cpt',
    label: 'Computer Proficiency Test (MCQ + Word, Excel, PowerPoint)',
    sections: [
      ['Computer Fundamentals', [['mcq', 20, 2]]],
      [
        'Practical',
        [
          ['ms_word', 1, 20],
          ['ms_excel', 1, 20],
          ['ms_powerpoint', 1, 20],
        ],
      ],
    ],
  },
  {
    id: 'screening',
    label: 'Objective Screening Test (150 MCQs, 1/3 negative)',
    sections: [
      ['General Studies', [['mcq', 100, 1, 0.33]]],
      ['Mental Ability', [['mcq', 50, 1, 0.33]]],
    ],
  },
  {
    id: 'mains',
    label: 'Descriptive Mains (short answers + essays)',
    sections: [
      [
        'General Essay',
        [
          ['short_answer', 10, 5],
          ['descriptive', 5, 10],
        ],
      ],
    ],
  },
  {
    id: 'mixed',
    label: 'Mixed Objective (MCQ, fill in the blanks, true/false, matching)',
    sections: [
      [
        'Objective',
        [
          ['mcq', 20, 1],
          ['fill_blank', 10, 1],
          ['true_false', 10, 1],
        ],
      ],
      ['Matching', [['match', 5, 2]]],
    ],
  },
];

export const presetOptions = presets.map(({ id, label }) => ({ value: id, label }));

/** Typical starting numbers for each kind of question. */
const defaults: Record<SectionGroup, [count: number, marks: number]> = {
  Objective: [10, 1],
  Written: [5, 5],
  Practical: [1, 20],
};

export function createGroup(type: SectionType = 'mcq'): QuestionGroup {
  const [questionCount, marksPerQuestion] = defaults[sectionTypes[type].group];
  return { id: nanoid(), type, questionCount, marksPerQuestion, negativeMarks: 0 };
}

export function buildPreset(id: string): ExamSection[] {
  const sections = presets.find((preset) => preset.id === id)?.sections ?? [];
  return sections.map(([title, groups], index) => ({
    id: nanoid(),
    name: partName(index),
    title,
    instructions: '',
    groups: groups.map(([type, count, marks, negative = 0]) => ({
      id: nanoid(),
      type,
      questionCount: count,
      marksPerQuestion: marks,
      negativeMarks: negative,
    })),
  }));
}

export function createSection(index: number): ExamSection {
  return {
    id: nanoid(),
    name: partName(index),
    title: '',
    instructions: '',
    groups: [createGroup()],
  };
}
