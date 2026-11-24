import { isAnyOf } from '@reduxjs/toolkit';
import type { AppStartListening } from '@/app/hooks';
import { getErrorStatus } from '@/shared/api/getErrorMessage';
import { sessionEnded } from '@/shared/api/session';
import { attemptApi } from '../api/attemptApi';
import { answerCleared, optionToggled } from './attemptSlice';

export const AUTOSAVE_DELAY_MS = 600;
export const AUTOSAVE_RETRY_MS = 5_000;

const { submitAttempt, saveAnswers } = attemptApi.endpoints;

const isStop = isAnyOf(submitAttempt.matchPending, sessionEnded);

/** Debounced autosave that retries until saved, superseded, submitted or logged out. */
export function registerAttemptListeners(startListening: AppStartListening) {
  startListening({
    matcher: isAnyOf(
      optionToggled,
      answerCleared,
      submitAttempt.matchPending,
      // A failed submit leaves the cancelled autosave outstanding, so restart it.
      submitAttempt.matchRejected,
      sessionEnded,
    ),
    effect: async (action, api) => {
      api.cancelActiveListeners();
      if (isStop(action)) return;

      // Snapshot now: the candidate may open another attempt during the delay.
      const { attemptId, answers, revision, savedRevision } = api.getState().attempt;
      if (!attemptId || savedRevision >= revision) return;

      await api.delay(AUTOSAVE_DELAY_MS);
      for (;;) {
        const { error } = await api.dispatch(
          saveAnswers.initiate({ attemptId, answers, revision }, { track: false }),
        );
        if (!error) return;
        // 4xx will not succeed on retry (e.g. the attempt has already ended).
        const status = getErrorStatus(error);
        if (typeof status === 'number' && status < 500) return;
        await api.delay(AUTOSAVE_RETRY_MS);
      }
    },
  });
}
