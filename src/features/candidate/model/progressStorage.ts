import type { CandidateState } from './candidateSlice';

// Bump the version when CandidateState changes shape or the sample questions change.
const STORAGE_KEY = 'exam-pro.candidate.v2';

/** Stands in for the server until these screens are connected; lasts for this tab only. */
export function loadProgress(): Partial<CandidateState> {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Partial<CandidateState>) : {};
  } catch {
    return {};
  }
}

export function saveProgress(state: CandidateState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, isSaving: false }));
  } catch {
    // Kept in memory only.
  }
}

export function clearProgress() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
