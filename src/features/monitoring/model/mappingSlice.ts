import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { sampleCandidates, type MonitoredCandidate } from '../data/sample';
import type { Assignment } from './mapping';

export type CandidateChanges = Partial<
  Pick<MonitoredCandidate, 'name' | 'mobile' | 'email' | 'preferences' | 'centreId' | 'systemId'>
>;

/** Registered candidates and their seats. In memory until connected to a server. */
const mappingSlice = createSlice({
  name: 'mapping',
  initialState: { candidates: sampleCandidates },
  reducers: {
    /** The Admin corrected a candidate's details or their seat. */
    candidateUpdated(
      state,
      { payload }: PayloadAction<{ registrationNo: string; changes: CandidateChanges }>,
    ) {
      const candidate = state.candidates.find(
        (item) => item.registrationNo === payload.registrationNo,
      );
      if (candidate) Object.assign(candidate, payload.changes);
    },
    candidatesMapped(state, { payload }: PayloadAction<Assignment[]>) {
      for (const { registrationNo, centreId, systemId } of payload) {
        const candidate = state.candidates.find((item) => item.registrationNo === registrationNo);
        // A seat already given to someone else is never handed out twice.
        const isTaken = state.candidates.some(
          (item) => item.systemId === systemId && item.registrationNo !== registrationNo,
        );
        if (candidate && !isTaken) Object.assign(candidate, { centreId, systemId });
      }
    },
  },
  selectors: { selectCandidates: (state) => state.candidates },
});

export const mappingReducer = mappingSlice.reducer;
export const { candidateUpdated, candidatesMapped } = mappingSlice.actions;
export const { selectCandidates } = mappingSlice.selectors;
