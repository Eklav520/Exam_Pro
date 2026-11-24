import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { env } from '@/shared/config/env';
import { sessionEnded } from './session';

/** The slice of root state this layer relies on; owned by features/auth. */
interface SessionState {
  auth: { token: string | null };
}

const getToken = (getState: () => unknown) => (getState() as SessionState).auth.token;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = getToken(getState);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extra,
) => {
  const token = getToken(api.getState);
  const result = await rawBaseQuery(args, api, extra);
  // Only end the session the failed request belonged to: not a bad login, nor a
  // late 401 from a previous user after someone else has signed in.
  if (result.error?.status === 401 && token && token === getToken(api.getState)) {
    api.dispatch(sessionEnded('expired'));
  }
  return result;
};

/** Features add their own endpoints with `baseApi.injectEndpoints`. */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Me', 'Exam', 'AdminExam', 'Result'],
  endpoints: () => ({}),
});
