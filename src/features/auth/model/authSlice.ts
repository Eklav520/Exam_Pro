import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { sessionEnded } from '@/shared/api/session';
import { tokenStorage } from '@/shared/lib/storage';

interface AuthState {
  token: string | null;
  /** True after choosing to log out: the next sign-in should not reopen the old page. */
  hasLoggedOut: boolean;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: (): AuthState => ({ token: tokenStorage.get(), hasLoggedOut: false }),
  reducers: {
    /** After the password and the mobile OTP are both verified. */
    signedIn(state, { payload }: PayloadAction<string>) {
      state.token = payload;
      state.hasLoggedOut = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sessionEnded, (state, { payload }) => {
      state.token = null;
      state.hasLoggedOut = payload === 'logout';
    });
  },
  selectors: {
    selectIsAuthenticated: (state) => state.token !== null,
    selectHasLoggedOut: (state) => state.hasLoggedOut,
  },
});

export const authReducer = authSlice.reducer;
export const { signedIn } = authSlice.actions;
export const { selectIsAuthenticated, selectHasLoggedOut } = authSlice.selectors;
