import { sectionTypes } from '@/shared/lib/examPattern';
import { htmlToText } from '@/shared/lib/richText';
import type { PatternQuestion } from './paper';

/** The answer key of a question in a few words, for lists. */
export function answerSummary(question: PatternQuestion): string {
  if (sectionTypes[question.type].group === 'Practical')
    return htmlToText(question.instructions ?? '');
  switch (question.type) {
    case 'mcq': {
      const index = question.correctIndex ?? 0;
      return `${String.fromCharCode(65 + index)}) ${question.options?.[index] ?? ''}`;
    }
    case 'match':
      return `${question.pairs?.length ?? 0} pairs`;
    case 'short_answer':
    case 'descriptive':
      return question.answer ? `Model answer: ${question.answer}` : 'No model answer';
    default:
      return question.answer ?? '';
  }
}
