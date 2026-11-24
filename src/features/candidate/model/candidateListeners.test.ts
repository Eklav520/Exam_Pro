import { makeStore } from '@/app/store';
import { examStarted, wordEdited } from './candidateSlice';
import { clearProgress, loadProgress } from './progressStorage';

describe('saving progress', () => {
  afterEach(() => vi.useRealTimers());

  it('saves an edit at once and does not write again when the notice ends', async () => {
    vi.useFakeTimers();
    const store = makeStore();
    store.dispatch(examStarted());
    store.dispatch(wordEdited('My report'));
    expect(loadProgress().work?.word).toBe('My report');

    clearProgress();
    await vi.advanceTimersByTimeAsync(2_000);
    expect(store.getState().candidate.isSaving).toBe(false);
    expect(loadProgress()).toEqual({});
  });
});
