import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { sessionEnded } from '@/shared/api/session';
import { EXAM_DURATION_MS, sectionA, taskIds, type TaskId } from '../data/sample';
import { loadProgress } from './progressStorage';

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';
export type QuestionStatus = 'current' | 'marked' | 'attempted' | 'not_attempted';

export interface Slide {
  title: string;
  body: string;
}

export interface CandidateState {
  /** Epoch ms; null until the candidate starts. */
  deadline: number | null;
  submittedAt: string | null;
  currentQuestion: number;
  /** Chosen option index by question index. */
  answers: Record<number, number>;
  marked: number[];
  tasks: Record<TaskId, ProgressStatus>;
  work: { word: string; excel: Record<string, string>; powerpoint: Slide[] };
  isSaving: boolean;
}

export const createProgress = (): CandidateState => ({
  deadline: null,
  submittedAt: null,
  currentQuestion: 0,
  answers: {},
  marked: [],
  tasks: { word: 'not_started', excel: 'not_started', powerpoint: 'not_started' },
  work: { word: '', excel: {}, powerpoint: [{ title: '', body: '' }] },
  isSaving: false,
});

function edited(state: CandidateState, task: TaskId) {
  state.tasks[task] = 'in_progress';
  state.isSaving = true;
}

const candidateSlice = createSlice({
  name: 'candidate',
  initialState: (): CandidateState => ({ ...createProgress(), ...loadProgress() }),
  reducers: {
    examStarted: {
      prepare: () => ({ payload: Date.now() + EXAM_DURATION_MS }),
      reducer: (state, { payload }: PayloadAction<number>) => {
        state.deadline ??= payload;
      },
    },
    examSubmitted: {
      prepare: () => ({ payload: new Date().toISOString() }),
      reducer: (state, { payload }: PayloadAction<string>) => {
        state.submittedAt ??= payload;
      },
    },
    questionOpened(state, { payload }: PayloadAction<number>) {
      if (payload >= 0 && payload < sectionA.questionCount) state.currentQuestion = payload;
    },
    optionChosen(state, { payload }: PayloadAction<{ question: number; option: number }>) {
      state.answers[payload.question] = payload.option;
      state.isSaving = true;
    },
    markToggled(state, { payload }: PayloadAction<number>) {
      state.marked = state.marked.includes(payload)
        ? state.marked.filter((question) => question !== payload)
        : [...state.marked, payload];
    },
    taskOpened(state, { payload }: PayloadAction<TaskId>) {
      if (state.tasks[payload] === 'not_started') state.tasks[payload] = 'in_progress';
    },
    taskCompleted(state, { payload }: PayloadAction<TaskId>) {
      state.tasks[payload] = 'completed';
    },
    wordEdited(state, { payload }: PayloadAction<string>) {
      state.work.word = payload;
      edited(state, 'word');
    },
    cellEdited(state, { payload }: PayloadAction<{ cell: string; value: string }>) {
      state.work.excel[payload.cell] = payload.value;
      edited(state, 'excel');
    },
    slideEdited(state, { payload }: PayloadAction<{ index: number; change: Partial<Slide> }>) {
      const slide = state.work.powerpoint[payload.index];
      if (!slide) return;
      Object.assign(slide, payload.change);
      edited(state, 'powerpoint');
    },
    slideAdded(state) {
      state.work.powerpoint.push({ title: '', body: '' });
      edited(state, 'powerpoint');
    },
    progressSaved(state) {
      state.isSaving = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sessionEnded, () => createProgress());
  },
  selectors: {
    selectCandidate: (state) => state,
    selectStage: (state): 'ready' | 'running' | 'submitted' => {
      if (state.submittedAt) return 'submitted';
      return state.deadline === null ? 'ready' : 'running';
    },
    selectSectionAStatus: (state) => getSectionAStatus(state),
    /** Each question has exactly one status, so the counts add up to the total. */
    selectPalette: createSelector(
      [
        (state: CandidateState) => state.currentQuestion,
        (state: CandidateState) => state.answers,
        (state: CandidateState) => state.marked,
      ],
      (current, answers, marked): QuestionStatus[] =>
        Array.from({ length: sectionA.questionCount }, (_item, index) => {
          if (index === current) return 'current';
          if (marked.includes(index)) return 'marked';
          return answers[index] === undefined ? 'not_attempted' : 'attempted';
        }),
    ),
    selectCompletion: createSelector(
      [(state: CandidateState) => getSectionAStatus(state), (state: CandidateState) => state.tasks],
      (statusA, tasks) => {
        const statuses = [statusA, ...taskIds.map((id) => tasks[id])];
        const completed = statuses.filter((status) => status === 'completed').length;
        return {
          completed,
          total: statuses.length,
          percent: Math.round((completed / statuses.length) * 100),
        };
      },
    ),
  },
});

function getSectionAStatus(state: CandidateState): ProgressStatus {
  const answered = Object.keys(state.answers).length;
  if (answered === 0) return 'not_started';
  return answered === sectionA.questionCount ? 'completed' : 'in_progress';
}

export const candidateReducer = candidateSlice.reducer;
export const {
  examStarted,
  examSubmitted,
  questionOpened,
  optionChosen,
  markToggled,
  taskOpened,
  taskCompleted,
  wordEdited,
  cellEdited,
  slideEdited,
  slideAdded,
  progressSaved,
} = candidateSlice.actions;
export const {
  selectCandidate,
  selectStage,
  selectSectionAStatus,
  selectPalette,
  selectCompletion,
} = candidateSlice.selectors;
