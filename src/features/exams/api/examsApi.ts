import { baseApi } from '@/shared/api/baseApi';
import type { StudentExam } from '@/shared/types';

const examsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getExams: build.query<StudentExam[], void>({
      query: () => '/exams',
      providesTags: ['Exam'],
    }),
    getExam: build.query<StudentExam, string>({
      query: (id) => `/exams/${id}`,
      providesTags: ['Exam'],
    }),
  }),
});

export const { useGetExamsQuery, useGetExamQuery } = examsApi;
