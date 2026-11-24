import { nanoid } from '@reduxjs/toolkit';
import { z } from 'zod';
import type { ExamInput, Question } from '@/shared/types';

const number = (message: string) => z.number({ error: message });

const questionSchema = z
  .object({
    id: z.string(),
    type: z.enum(['single', 'multiple']),
    text: z.string().trim().min(1, 'Enter the question'),
    options: z
      .array(z.object({ id: z.string(), text: z.string().trim().min(1, 'Enter the option') }))
      .min(2, 'Add at least two options'),
    correctOptionIds: z.array(z.string()).min(1, 'Choose the correct answer'),
    marks: number('Enter the marks').positive('Marks must be more than 0'),
    explanation: z.string().trim(),
  })
  .refine((question) => question.type === 'multiple' || question.correctOptionIds.length <= 1, {
    path: ['correctOptionIds'],
    message: 'A single-answer question has one correct option',
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
  })
  .refine((exam) => exam.status === 'draft' || exam.questions.length > 0, {
    path: ['questions'],
    message: 'Add at least one question before publishing',
  }) satisfies z.ZodType<ExamInput>;

export function createQuestion(): Question {
  return {
    id: nanoid(),
    type: 'single',
    text: '',
    options: [createOption(), createOption()],
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
  };
}
