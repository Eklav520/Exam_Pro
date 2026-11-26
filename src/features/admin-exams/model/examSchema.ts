import { nanoid } from '@reduxjs/toolkit';
import { z } from 'zod';
import { practicalApps } from '@/features/question-papers';
import type { ExamInput, Question } from '@/shared/types';

const number = (message: string) => z.number({ error: message });
const marks = number('Enter the marks').positive('Marks must be more than 0');

export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 6;

export const questionSchema = z
  .object({
    id: z.string(),
    type: z.enum(['single', 'multiple']),
    text: z.string().trim().min(1, 'Enter the question'),
    options: z
      .array(z.object({ id: z.string(), text: z.string().trim().min(1, 'Enter the option') }))
      .min(MIN_OPTIONS, `Add at least ${MIN_OPTIONS} options`)
      .max(MAX_OPTIONS),
    correctOptionIds: z.array(z.string()).min(1, 'Choose the correct answer'),
    marks,
    explanation: z.string().trim(),
  })
  .refine((question) => question.type === 'multiple' || question.correctOptionIds.length <= 1, {
    path: ['correctOptionIds'],
    message: 'A single-answer question has one correct option',
  });

export const taskSchema = z.object({
  id: z.string(),
  app: z.enum(practicalApps),
  title: z.string().trim().min(1, 'Enter the task title'),
  instructions: z.string().trim().min(1, 'Enter the instructions'),
  marks,
});

export const examSchema = z
  .object({
    title: z.string().trim().min(3, 'Use at least 3 characters'),
    subject: z.string().trim().min(1, 'Enter a subject'),
    description: z.string().trim(),
    durationMinutes: number('Enter the duration')
      .int('Use whole minutes')
      .min(1, 'At least 1 minute')
      .max(480, 'At most 480 minutes'),
    passPercentage: number('Enter the pass mark').min(0, 'Use 0 to 100').max(100, 'Use 0 to 100'),
    negativeMarking: number('Enter a fraction').min(0, 'Use 0 to 1').max(1, 'Use 0 to 1'),
    status: z.enum(['draft', 'published']),
    questions: z.array(questionSchema),
    tasks: z.array(taskSchema),
  })
  .refine((exam) => exam.status === 'draft' || exam.questions.length + exam.tasks.length > 0, {
    path: ['questions'],
    message: 'Add at least one question or task before publishing',
  }) satisfies z.ZodType<ExamInput>;

/** Fields on the first step, checked before moving on. */
export const detailFields = [
  'title',
  'subject',
  'description',
  'durationMinutes',
  'passPercentage',
  'negativeMarking',
  'status',
] as const;

export function createQuestion(): Question {
  return {
    id: nanoid(),
    type: 'single',
    text: '',
    options: [createOption(), createOption(), createOption(), createOption()],
    correctOptionIds: [],
    marks: 1,
    explanation: '',
  };
}

export function createOption() {
  return { id: nanoid(), text: '' };
}

export function createExamInput(): ExamInput {
  return {
    title: '',
    subject: '',
    description: '',
    durationMinutes: 30,
    passPercentage: 40,
    negativeMarking: 0,
    status: 'draft',
    questions: [],
    tasks: [],
  };
}
