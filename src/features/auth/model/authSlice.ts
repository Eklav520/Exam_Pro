import { createSlice } from '@reduxjs/toolkit';
import { sessionEnded } from '@/shared/api/session';
import { tokenStorage } from '@/shared/lib/storage';
import { authApi } from '../api/authApi';

interface AuthState {
  token: string | null;
  /** True after choosing to log out: the next sign-in should not reopen the old page. */
  hasLoggedOut: boolean;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: (): AuthState => ({ token: tokenStorage.get(), hasLoggedOut: false }),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sessionEnded, (state, { payload }) => {
        state.token = null;
        state.hasLoggedOut = payload === 'logout';
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
        state.token = payload.token;
        state.hasLoggedOut = false;
      });
  },
  selectors: {
    selectIsAuthenticated: (state) => state.token !== null,
    selectHasLoggedOut: (state) => state.hasLoggedOut,
  },
});

export const authReducer = authSlice.reducer;
export const { selectIsAuthenticated, selectHasLoggedOut } = authSlice.selectors;
