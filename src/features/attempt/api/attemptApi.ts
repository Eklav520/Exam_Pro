import { baseApi } from '@/shared/api/baseApi';
import type { AnswersPayload, Attempt } from '@/shared/types';

export interface SaveAnswersArgs extends AnswersPayload {
  attemptId: string;
}

export const attemptApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** Starts a new attempt, or returns the unfinished one. */
    startAttempt: build.mutation<Attempt, string>({
      query: (examId) => ({ url: `/exams/${examId}/attempts`, method: 'POST' }),
      invalidatesTags: ['Exam'],
    }),
    getAttempt: build.query<Attempt, string>({
      query: (attemptId) => `/attempts/${attemptId}`,
      // The store is the source of truth while answering; a cached copy would be stale.
      keepUnusedDataFor: 0,
    }),
    saveAnswers: build.mutation<{ revision: number }, SaveAnswersArgs>({
      query: ({ attemptId, ...body }) => ({
        url: `/attempts/${attemptId}/answers`,
        method: 'PUT',
        body,
      }),
    }),
    /** Idempotent. Carries the final answers so a pending autosave cannot be lost. */
    submitAttempt: build.mutation<{ attemptId: string }, SaveAnswersArgs>({
      query: ({ attemptId, ...body }) => ({
        url: `/attempts/${attemptId}/submit`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Exam', 'Result'],
    }),
  }),
});

export const { useStartAttemptMutation, useGetAttemptQuery, useSubmitAttemptMutation } = attemptApi;
