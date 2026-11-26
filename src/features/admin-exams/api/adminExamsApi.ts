import { baseApi } from '@/shared/api/baseApi';
import type { Exam, ExamInput, ExamSummary } from '@/shared/types';

const adminExamsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminExams: build.query<ExamSummary[], void>({
      query: () => '/admin/exams',
      transformResponse: (exams: ExamSummary[]) =>
        exams.map((exam) => ({ ...exam, taskCount: exam.taskCount ?? 0 })),
      providesTags: ['AdminExam'],
    }),
    getAdminExam: build.query<Exam, string>({
      query: (id) => `/admin/exams/${id}`,
      transformResponse: (exam: Exam) => ({
        ...exam,
        tasks: exam.tasks ?? [],
        sections: exam.sections ?? [],
      }),
      providesTags: (_result, _error, id) => [{ type: 'AdminExam', id }],
      // An edit form must start from the latest version.
      keepUnusedDataFor: 0,
    }),
    createExam: build.mutation<Exam, ExamInput>({
      query: (body) => ({ url: '/admin/exams', method: 'POST', body }),
      invalidatesTags: ['AdminExam'],
    }),
    updateExam: build.mutation<Exam, { id: string; input: ExamInput }>({
      query: ({ id, input }) => ({ url: `/admin/exams/${id}`, method: 'PUT', body: input }),
      invalidatesTags: ['AdminExam'],
    }),
    deleteExam: build.mutation<null, string>({
      query: (id) => ({ url: `/admin/exams/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminExam'],
    }),
  }),
});

export const {
  useGetAdminExamsQuery,
  useGetAdminExamQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
} = adminExamsApi;
