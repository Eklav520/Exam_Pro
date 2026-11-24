import { createAction } from '@reduxjs/toolkit';

/** Dispatched on logout and whenever the API rejects our token. Resets all state. */
export const sessionEnded = createAction<'logout' | 'expired'>('session/ended');
