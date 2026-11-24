import type { AppStartListening } from '@/app/hooks';
import { sessionEnded } from '@/shared/api/session';
import { progressSaved } from './candidateSlice';
import { clearProgress, saveProgress } from './progressStorage';

/** How long "Auto-saving" stays visible after an edit. */
const SAVING_NOTICE_MS = 800;

export function registerCandidateListeners(startListening: AppStartListening) {
  startListening({
    predicate: (action, current, previous) =>
      current.candidate !== previous.candidate &&
      !sessionEnded.match(action) &&
      // Only ends the notice: the edit itself is already stored.
      !progressSaved.match(action),
    effect: async (_action, api) => {
      api.cancelActiveListeners();
      const { candidate } = api.getState();
      saveProgress(candidate);
      if (!candidate.isSaving) return;
      await api.delay(SAVING_NOTICE_MS);
      api.dispatch(progressSaved());
    },
  });

  startListening({ actionCreator: sessionEnded, effect: () => clearProgress() });
}
