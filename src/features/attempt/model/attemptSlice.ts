import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { sessionEnded } from '@/shared/api/session';
import type { AnswerMap, Attempt, QuestionType } from '@/shared/types';
import { attemptApi } from '../api/attemptApi';

export type QuestionStatus = 'answered' | 'skipped' | 'unseen';
export type SaveStatus = 'saved' | 'saving' | 'error';

interface AttemptState {
  attemptId: string | null;
  questionIds: string[];
  currentIndex: number;
  answers: AnswerMap;
  marked: string[];
  visited: string[];
  /** Epoch ms on this device's clock. */
  deadline: number;
  revision: number;
  savedRevision: number;
  saveFailed: boolean;
}

const initialState: AttemptState = {
  attemptId: null,
  questionIds: [],
  currentIndex: 0,
  answers: {},
  marked: [],
  visited: [],
  deadline: 0,
  revision: 0,
  savedRevision: 0,
  saveFailed: false,
};

interface OptionToggled {
  questionId: string;
  optionId: string;
  type: QuestionType;
}

function setAnswer(state: AttemptState, questionId: string, optionIds: string[]) {
  if (optionIds.length > 0) state.answers[questionId] = optionIds;
  else delete state.answers[questionId];
  state.revision += 1;
}

const attemptSlice = createSlice({
  name: 'attempt',
  initialState,
  reducers: {
    attemptLoaded: {
      prepare: (attempt: Attempt) => ({ payload: { attempt, receivedAt: Date.now() } }),
      reducer: (
        _state,
        { payload }: PayloadAction<{ attempt: Attempt; receivedAt: number }>,
      ): AttemptState => {
        const { attempt, receivedAt } = payload;
        const remaining = Date.parse(attempt.expiresAt) - Date.parse(attempt.serverTime);
        const questionIds = attempt.questions.map((question) => question.id);
        return {
          ...initialState,
          attemptId: attempt.id,
          questionIds,
          answers: attempt.answers,
          visited: [...new Set([...questionIds.slice(0, 1), ...Object.keys(attempt.answers)])],
          deadline: receivedAt + remaining,
          revision: attempt.revision,
          savedRevision: attempt.revision,
        };
      },
    },
    questionOpened(state, { payload: index }: PayloadAction<number>) {
      const questionId = state.questionIds[index];
      if (questionId === undefined) return;
      state.currentIndex = index;
      if (!state.visited.includes(questionId)) state.visited.push(questionId);
    },
    optionToggled(state, { payload }: PayloadAction<OptionToggled>) {
      const { questionId, optionId, type } = payload;
      const current = state.answers[questionId] ?? [];
      if (type === 'single') {
        setAnswer(state, questionId, [optionId]);
      } else if (current.includes(optionId)) {
        setAnswer(
          state,
          questionId,
          current.filter((id) => id !== optionId),
        );
      } else {
        setAnswer(state, questionId, [...current, optionId]);
      }
    },
    answerCleared(state, { payload: questionId }: PayloadAction<string>) {
      setAnswer(state, questionId, []);
    },
    markToggled(state, { payload: questionId }: PayloadAction<string>) {
      state.marked = state.marked.includes(questionId)
        ? state.marked.filter((id) => id !== questionId)
        : [...state.marked, questionId];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sessionEnded, () => initialState)
      .addMatcher(attemptApi.endpoints.saveAnswers.matchFulfilled, (state, { meta }) => {
        const { attemptId, revision } = meta.arg.originalArgs;
        if (attemptId !== state.attemptId) return;
        state.savedRevision = Math.max(state.savedRevision, revision);
        state.saveFailed = false;
      })
      .addMatcher(attemptApi.endpoints.saveAnswers.matchRejected, (state, { meta }) => {
        if (meta.arg.originalArgs.attemptId === state.attemptId) state.saveFailed = true;
      });
  },
  selectors: {
    selectAttempt: (state) => state,
    selectSaveStatus: (state): SaveStatus => {
      if (state.savedRevision >= state.revision) return 'saved';
      return state.saveFailed ? 'error' : 'saving';
    },
    selectPalette: createSelector(
      [
        (state: AttemptState) => state.questionIds,
        (state: AttemptState) => state.answers,
        (state: AttemptState) => state.visited,
        (state: AttemptState) => state.marked,
      ],
      (questionIds, answers, visited, marked) =>
        questionIds.map((id) => {
          const seen = visited.includes(id);
          const status: QuestionStatus = answers[id] ? 'answered' : seen ? 'skipped' : 'unseen';
          return { id, status, isMarked: marked.includes(id) };
        }),
    ),
  },
});

export const attemptReducer = attemptSlice.reducer;
export const { attemptLoaded, questionOpened, optionToggled, answerCleared, markToggled } =
  attemptSlice.actions;
export const { selectAttempt, selectSaveStatus, selectPalette } = attemptSlice.selectors;
