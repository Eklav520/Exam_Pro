import type { AppStartListening } from '@/app/hooks';
import { savePapers } from './paperStorage';

export function registerPaperListeners(startListening: AppStartListening) {
  startListening({
    predicate: (_action, current, previous) => current.papers !== previous.papers,
    effect: (_action, api) => savePapers(api.getState().papers.papers),
  });
}
