import { makeStore } from '@/app/store';
import type { Attempt } from '@/shared/types';
import {
  answerCleared,
  attemptLoaded,
  markToggled,
  optionToggled,
  questionOpened,
  selectPalette,
} from './attemptSlice';

const now = Date.now();
const attempt: Attempt = {
  id: 'a1',
  examId: 'e1',
  examTitle: 'Exam',
  status: 'in_progress',
  startedAt: new Date(now).toISOString(),
  expiresAt: new Date(now + 60_000).toISOString(),
  serverTime: new Date(now).toISOString(),
  questions: ['q1', 'q2', 'q3'].map((id) => ({
    id,
    type: 'single',
    text: id,
    options: [],
    marks: 1,
  })),
  answers: {},
  revision: 0,
};

function setup(overrides: Partial<Attempt> = {}) {
  const store = makeStore();
  store.dispatch(attemptLoaded({ ...attempt, ...overrides }));
  return store;
}

describe('attempt slice', () => {
  it('computes the deadline from the server clock, not the device clock', () => {
    const skewed = now - 3_600_000;
    const store = setup({
      serverTime: new Date(skewed).toISOString(),
      expiresAt: new Date(skewed + 60_000).toISOString(),
    });
    const remaining = store.getState().attempt.deadline - Date.now();
    expect(remaining).toBeGreaterThan(59_000);
    expect(remaining).toBeLessThanOrEqual(60_000);
  });

  it('replaces single answers and toggles multiple answers', () => {
    const store = setup();
    const toggle = (questionId: string, optionId: string, type: 'single' | 'multiple') =>
      store.dispatch(optionToggled({ questionId, optionId, type }));
    toggle('q1', 'a', 'single');
    toggle('q1', 'b', 'single');
    toggle('q2', 'a', 'multiple');
    toggle('q2', 'b', 'multiple');
    toggle('q2', 'a', 'multiple');
    expect(store.getState().attempt.answers).toEqual({ q1: ['b'], q2: ['b'] });
  });

  it('derives palette status', () => {
    const store = setup();
    store.dispatch(optionToggled({ questionId: 'q1', optionId: 'a', type: 'single' }));
    store.dispatch(questionOpened(1));
    store.dispatch(markToggled('q2'));
    expect(selectPalette(store.getState())).toEqual([
      { id: 'q1', status: 'answered', isMarked: false },
      { id: 'q2', status: 'skipped', isMarked: true },
      { id: 'q3', status: 'unseen', isMarked: false },
    ]);
    store.dispatch(answerCleared('q1'));
    expect(selectPalette(store.getState())[0]?.status).toBe('skipped');
  });

  it('ignores out-of-range navigation', () => {
    const store = setup();
    store.dispatch(questionOpened(99));
    expect(store.getState().attempt.currentIndex).toBe(0);
  });
});
