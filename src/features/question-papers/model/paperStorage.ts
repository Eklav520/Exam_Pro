import type { PaperSet } from './paper';

// Bump the version when PaperSet changes shape.
const STORAGE_KEY = 'exam-pro.papers.v2';

/** Stands in for the server until question papers are connected; this browser only. */
export function loadPapers(): PaperSet[] | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as PaperSet[]) : null;
  } catch {
    return null;
  }
}

export function savePapers(papers: PaperSet[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
  } catch {
    // Kept in memory only.
  }
}
