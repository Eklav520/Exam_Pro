import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { samplePapers } from '../data/sample';
import { formatDay, formatStamp, type PaperSet } from './paper';
import { loadPapers } from './paperStorage';

interface PapersState {
  papers: PaperSet[];
}

const now = () => {
  const date = new Date();
  return { day: formatDay(date), stamp: formatStamp(date) };
};

type Stamped<T> = T & { now: ReturnType<typeof now> };

const papersSlice = createSlice({
  name: 'papers',
  initialState: (): PapersState => ({ papers: loadPapers() ?? samplePapers }),
  reducers: {
    /** The Admin gives a new set of an exam to a paper setter. */
    setAssigned: {
      prepare: (paper: PaperSet) => ({ payload: { paper, now: now() } }),
      reducer: (state, { payload }: PayloadAction<Stamped<{ paper: PaperSet }>>) => {
        const { paper } = payload;
        const isTaken = state.papers.some(
          (item) => item.examId === paper.examId && item.name === paper.name,
        );
        if (isTaken) return;
        state.papers.push({
          ...paper,
          assignedOn: payload.now.day,
          updatedAt: payload.now.stamp,
        });
      },
    },
    /** Takes back a set the setter has not started; once work exists it stays. */
    assignmentRemoved(state, { payload }: PayloadAction<string>) {
      state.papers = state.papers.filter(
        (paper) =>
          paper.id !== payload ||
          paper.status !== 'draft' ||
          paper.mcqs.length + paper.tasks.length > 0,
      );
    },
    /** Adds the set, or replaces the draft with the same id. */
    paperSaved: {
      prepare: (paper: PaperSet) => ({ payload: { paper, now: now() } }),
      reducer: (state, { payload }: PayloadAction<Stamped<{ paper: PaperSet }>>) => {
        const saved = { ...payload.paper, updatedAt: payload.now.stamp };
        const index = state.papers.findIndex((paper) => paper.id === saved.id);
        if (index === -1) state.papers.push(saved);
        else if (state.papers[index]?.status === 'draft') state.papers[index] = saved;
      },
    },
    paperSubmitted: {
      prepare: (id: string) => ({ payload: { id, now: now() } }),
      reducer: (state, { payload }: PayloadAction<Stamped<{ id: string }>>) => {
        const paper = state.papers.find((item) => item.id === payload.id);
        if (paper?.status !== 'draft') return;
        paper.status = 'under_review';
        paper.submittedOn = payload.now.day;
        paper.updatedAt = payload.now.stamp;
        paper.remarks = '';
      },
    },
    paperApproved(state, { payload }: PayloadAction<string>) {
      const paper = state.papers.find((item) => item.id === payload);
      if (paper?.status === 'under_review') paper.status = 'approved';
    },
    paperReturned(state, { payload }: PayloadAction<{ id: string; remarks: string }>) {
      const paper = state.papers.find((item) => item.id === payload.id);
      if (paper?.status !== 'under_review') return;
      paper.status = 'draft';
      paper.remarks = payload.remarks;
    },
  },
  selectors: { selectPapers: (state) => state.papers },
});

export const papersReducer = papersSlice.reducer;
export const {
  setAssigned,
  assignmentRemoved,
  paperSaved,
  paperSubmitted,
  paperApproved,
  paperReturned,
} = papersSlice.actions;
export const { selectPapers } = papersSlice.selectors;
