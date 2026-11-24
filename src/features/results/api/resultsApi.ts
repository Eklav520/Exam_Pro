import { baseApi } from '@/shared/api/baseApi';
import type { Result, ResultSummary } from '@/shared/types';

const resultsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getResults: build.query<ResultSummary[], void>({
      query: () => '/results',
      providesTags: ['Result'],
    }),
    getResult: build.query<Result, string>({
      query: (attemptId) => `/results/${attemptId}`,
      providesTags: ['Result'],
    }),
  }),
});

export const { useGetResultsQuery, useGetResultQuery } = resultsApi;
