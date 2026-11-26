import type { ExamSection, QuestionGroup, SectionType } from '@/shared/types';

export type SectionGroup = 'Objective' | 'Written' | 'Practical';

interface SectionTypeConfig {
  label: string;
  group: SectionGroup;
}

/** Every kind of question an exam can have. Add a type here to offer it everywhere. */
export const sectionTypes: Record<SectionType, SectionTypeConfig> = {
  mcq: { label: 'Multiple Choice (MCQ)', group: 'Objective' },
  true_false: { label: 'True / False', group: 'Objective' },
  fill_blank: { label: 'Fill in the Blanks', group: 'Objective' },
  match: { label: 'Match the Following', group: 'Objective' },
  short_answer: { label: 'Short Answer', group: 'Written' },
  descriptive: { label: 'Descriptive / Essay', group: 'Written' },
  ms_word: { label: 'MS Word Practical', group: 'Practical' },
  ms_excel: { label: 'MS Excel Practical', group: 'Practical' },
  ms_powerpoint: { label: 'MS PowerPoint Practical', group: 'Practical' },
};

export const sectionTypeIds = Object.keys(sectionTypes) as [SectionType, ...SectionType[]];

export const sectionGroups: SectionGroup[] = ['Objective', 'Written', 'Practical'];

/** Objective answers are marked automatically, so only they can lose marks. */
export const isObjective = (type: SectionType) => sectionTypes[type].group === 'Objective';

/** "20 questions", or "1 task" for practical work. */
export const itemWord = (type: SectionType, count: number) => {
  const word = sectionTypes[type].group === 'Practical' ? 'task' : 'question';
  return `${count} ${word}${count === 1 ? '' : 's'}`;
};

const safe = (value: number) => (Number.isFinite(value) ? value : 0);

export const groupMarks = (group: Pick<QuestionGroup, 'questionCount' | 'marksPerQuestion'>) =>
  safe(group.questionCount) * safe(group.marksPerQuestion);

export function getSectionTotals(section: Pick<ExamSection, 'groups'>) {
  return {
    questions: section.groups.reduce((sum, group) => sum + safe(group.questionCount), 0),
    marks: section.groups.reduce((sum, group) => sum + groupMarks(group), 0),
  };
}

export function getPatternTotals(sections: Pick<ExamSection, 'groups'>[]) {
  const totals = sections.map(getSectionTotals);
  return {
    questions: totals.reduce((sum, total) => sum + total.questions, 0),
    marks: totals.reduce((sum, total) => sum + total.marks, 0),
  };
}

export type Marking = 'auto' | 'evaluator' | 'mixed';

/** Who marks a section: automatically, an evaluator, or both when it mixes types. */
export function getMarking(section: Pick<ExamSection, 'groups'>): Marking {
  const objective = section.groups.filter((group) => isObjective(group.type)).length;
  if (objective === section.groups.length) return 'auto';
  return objective === 0 ? 'evaluator' : 'mixed';
}

/** "Part A" for the first section, "Part B" for the second, … */
export const partName = (index: number) => `Part ${String.fromCharCode(65 + (index % 26))}`;
