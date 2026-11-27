import { combineReducers, configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { attemptReducer, registerAttemptListeners } from '@/features/attempt';
import { authReducer, registerAuthListeners } from '@/features/auth';
import { candidateReducer, registerCandidateListeners } from '@/features/candidate';
import { assignedReducer } from '@/features/evaluation';
import { mappingReducer } from '@/features/monitoring';
import { papersReducer, registerPaperListeners } from '@/features/question-papers';
import { baseApi } from '@/shared/api/baseApi';
import type { AppStartListening } from './hooks';

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
  attempt: attemptReducer,
  candidate: candidateReducer,
  assigned: assignedReducer,
  mapping: mappingReducer,
  papers: papersReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

/** A factory rather than a singleton, so every test gets an isolated store. */
export function makeStore(preloadedState?: Partial<RootState>) {
  const listener = createListenerMiddleware();

  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefault) =>
      getDefault().prepend(listener.middleware).concat(baseApi.middleware),
  });

  const startListening = listener.startListening as AppStartListening;
  registerAuthListeners(startListening);
  registerAttemptListeners(startListening);
  registerCandidateListeners(startListening);
  registerPaperListeners(startListening);

  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
