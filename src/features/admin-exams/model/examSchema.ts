import { z } from 'zod';
import { practicalApps } from '@/features/question-papers';
import type { ExamInput } from '@/shared/types';
import { isObjective, sectionTypeIds } from './sectionTypes';

const number = (message: string) => z.number({ error: message });
const marks = number('Enter the marks').positive('Marks must be more than 0');

// Questions and tasks are written by paper setters. The Admin form only keeps
// those an exam already has, so they are still checked on save.
const questionSchema = z
  .object({
    id: z.string(),
    type: z.enum(['single', 'multiple']),
    text: z.string().trim().min(1, 'Enter the question'),
    options: z
      .array(z.object({ id: z.string(), text: z.string().trim().min(1, 'Enter the option') }))
      .min(2),
    correctOptionIds: z.array(z.string()).min(1, 'Choose the correct answer'),
    marks,
    explanation: z.string().trim(),
  })
  .refine((question) => question.type === 'multiple' || question.correctOptionIds.length <= 1, {
    path: ['correctOptionIds'],
    message: 'A single-answer question has one correct option',
  });

const taskSchema = z.object({
  id: z.string(),
  app: z.enum(practicalApps),
  title: z.string().trim().min(1, 'Enter the task title'),
  instructions: z.string().trim().min(1, 'Enter the instructions'),
  marks,
});

const groupSchema = z
  .object({
    id: z.string(),
    type: z.enum(sectionTypeIds),
    questionCount: number('Enter how many')
      .int('Use a whole number')
      .min(1, 'At least 1')
      .max(500, 'At most 500'),
    marksPerQuestion: marks,
    negativeMarks: number('Enter 0 or more').min(0, 'Use 0 or more'),
  })
  .refine((group) => isObjective(group.type) || group.negativeMarks === 0, {
    path: ['negativeMarks'],
    message: 'Only objective questions can have negative marks',
  })
  .refine((group) => group.negativeMarks <= group.marksPerQuestion, {
    path: ['negativeMarks'],
    message: 'Cannot be more than the marks per question',
  });

export const sectionSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, 'Enter the part name'),
  title: z.string().trim(),
  instructions: z.string().trim(),
  groups: z.array(groupSchema).min(1, 'Add at least one question type'),
});

export const examSchema = z
  .object({
    title: z.string().trim().min(3, 'Use at least 3 characters'),
    subject: z.string().trim().min(1, 'Enter a subject'),
    description: z.string().trim(),
    notificationNo: z.string().trim(),
    examDate: z.string(),
    durationMinutes: number('Enter the duration')
      .int('Use whole minutes')
      .min(1, 'At least 1 minute')
      .max(480, 'At most 480 minutes'),
    passPercentage: number('Enter the pass mark').min(0, 'Use 0 to 100').max(100, 'Use 0 to 100'),
    negativeMarking: z.number(),
    status: z.enum(['draft', 'published']),
    sections: z.array(sectionSchema),
    questions: z.array(questionSchema),
    tasks: z.array(taskSchema),
  })
  .refine((exam) => exam.status === 'draft' || exam.sections.length > 0, {
    path: ['sections'],
    message: 'Add at least one section before publishing',
  }) satisfies z.ZodType<ExamInput>;

export type ExamFormValues = z.infer<typeof examSchema>;

/** Fields on the first step, checked before moving on. */
export const detailFields = [
  'title',
  'subject',
  'description',
  'notificationNo',
  'examDate',
  'durationMinutes',
  'passPercentage',
  'status',
] as const;

export function createExamInput(): ExamFormValues {
  return {
    title: '',
    subject: '',
    description: '',
    notificationNo: '',
    examDate: '',
    durationMinutes: 120,
    passPercentage: 40,
    negativeMarking: 0,
    status: 'draft',
    sections: [],
    questions: [],
    tasks: [],
  };
}

/** Form values for an exam, filling fields older exams do not have. */
export function toFormValues(exam: ExamInput): ExamFormValues {
  return {
    ...createExamInput(),
    ...exam,
    notificationNo: exam.notificationNo ?? '',
    examDate: exam.examDate ?? '',
    sections: exam.sections ?? [],
  };
}
