import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { sessionEnded } from '@/shared/api/session';
import type { StaffRole } from './staffRoles';

interface StaffState {
  /**
   * Role being previewed while the screens are designed. The backend has a single
   * "admin" role for now, so this changes what is shown and grants nothing.
   */
  role: StaffRole;
}

const initialState: StaffState = { role: 'main_admin' };

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    rolePreviewed(state, { payload }: PayloadAction<StaffRole>) {
      state.role = payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sessionEnded, () => initialState);
  },
  selectors: { selectStaffRole: (state) => state.role },
});

export const staffReducer = staffSlice.reducer;
export const { rolePreviewed } = staffSlice.actions;
export const { selectStaffRole } = staffSlice.selectors;
