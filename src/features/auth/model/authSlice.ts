import { createSlice } from '@reduxjs/toolkit';
import { sessionEnded } from '@/shared/api/session';
import { tokenStorage } from '@/shared/lib/storage';
import { authApi } from '../api/authApi';

interface AuthState {
  token: string | null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: (): AuthState => ({ token: tokenStorage.get() }),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sessionEnded, (state) => {
        state.token = null;
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
        state.token = payload.token;
      });
  },
  selectors: {
    selectIsAuthenticated: (state) => state.token !== null,
  },
});

export const authReducer = authSlice.reducer;
export const { selectIsAuthenticated } = authSlice.selectors;
