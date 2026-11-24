import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';
import { samplePapers } from '../data/sample';
import { formatDay, formatStamp, getNextSetName, type PaperSet } from './paper';
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
    paperDuplicated: {
      prepare: (id: string) => ({ payload: { id, newId: nanoid(), now: now() } }),
      reducer: (state, { payload }: PayloadAction<Stamped<{ id: string; newId: string }>>) => {
        const source = state.papers.find((paper) => paper.id === payload.id);
        if (!source) return;
        const name = getNextSetName(state.papers, source.exam);
        state.papers.push({
          ...source,
          id: payload.newId,
          name,
          title: source.title.replace(source.name, name),
          status: 'draft',
          submittedOn: null,
          updatedAt: payload.now.stamp,
          remarks: '',
        });
      },
    },
    paperDeleted(state, { payload }: PayloadAction<string>) {
      state.papers = state.papers.filter((paper) => paper.id !== payload);
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
  paperSaved,
  paperSubmitted,
  paperDuplicated,
  paperDeleted,
  paperApproved,
  paperReturned,
} = papersSlice.actions;
export const { selectPapers } = papersSlice.selectors;
