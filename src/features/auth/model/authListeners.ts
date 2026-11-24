import type { AppStartListening } from '@/app/hooks';
import { baseApi } from '@/shared/api/baseApi';
import { sessionEnded } from '@/shared/api/session';
import { tokenStorage } from '@/shared/lib/storage';
import { authApi } from '../api/authApi';

/** Keeps storage and the API cache in step with the session. */
export function registerAuthListeners(startListening: AppStartListening) {
  startListening({
    matcher: authApi.endpoints.login.matchFulfilled,
    effect: ({ payload }) => tokenStorage.set(payload.token),
  });

  startListening({
    actionCreator: sessionEnded,
    effect: (_action, api) => {
      tokenStorage.clear();
      // Never let the next user see the previous user's cached data.
      api.dispatch(baseApi.util.resetApiState());
    },
  });
}
