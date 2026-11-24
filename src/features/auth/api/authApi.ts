import { baseApi } from '@/shared/api/baseApi';
import type { User } from '@/shared/types';

export interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    getMe: build.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['Me'],
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery } = authApi;
