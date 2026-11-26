import { createSlice } from '@reduxjs/toolkit';
import { sampleScripts } from '../data/assigned';

/** Answer papers allocated to the signed-in evaluator. In memory until connected to a server. */
const assignedSlice = createSlice({
  name: 'assigned',
  initialState: { scripts: sampleScripts },
  reducers: {
    /** Sends every evaluated paper to the Higher Official. */
    evaluatedScriptsSent(state) {
      for (const script of state.scripts) {
        if (script.status === 'evaluated') script.status = 'sent';
      }
    },
  },
  selectors: { selectAssignedScripts: (state) => state.scripts },
});

export const assignedReducer = assignedSlice.reducer;
export const { evaluatedScriptsSent } = assignedSlice.actions;
export const { selectAssignedScripts } = assignedSlice.selectors;

export function countScripts(scripts: { status: string }[]) {
  const count = (status: string) => scripts.filter((script) => script.status === status).length;
  return {
    assigned: scripts.length,
    pending: count('pending'),
    evaluated: count('evaluated'),
    sent: count('sent'),
  };
}
