const TOKEN_KEY = 'exam-pro.token';

/** Storage can throw (private mode, blocked site data); fall back to memory. */
let memoryToken: string | null = null;

export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY) ?? memoryToken;
    } catch {
      return memoryToken;
    }
  },
  set(token: string) {
    memoryToken = token;
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Session simply won't survive a reload.
    }
  },
  clear() {
    memoryToken = null;
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Nothing to clear.
    }
  },
};
