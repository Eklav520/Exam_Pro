const FALLBACK = 'Something went wrong. Please try again.';

export function getErrorStatus(error: unknown): number | string | undefined {
  if (typeof error !== 'object' || error === null || !('status' in error)) return undefined;
  const { status } = error;
  return typeof status === 'number' || typeof status === 'string' ? status : undefined;
}

/** Turns an RTK Query error into text that is safe to show to a user. */
export function getErrorMessage(error: unknown): string {
  if (getErrorStatus(error) === 'FETCH_ERROR') {
    return 'Could not reach the server. Check your connection and try again.';
  }
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const { data } = error;
    if (typeof data === 'object' && data !== null && 'message' in data) {
      if (typeof data.message === 'string') return data.message;
    }
  }
  return FALLBACK;
}
