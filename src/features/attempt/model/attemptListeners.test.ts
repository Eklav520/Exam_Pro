import { http, HttpResponse } from 'msw';
import { makeStore } from '@/app/store';
import { db } from '@/mocks/db';
import { server } from '@/mocks/server';
import { attemptApi } from '../api/attemptApi';
import { AUTOSAVE_DELAY_MS, AUTOSAVE_RETRY_MS } from './attemptListeners';
import { attemptLoaded, optionToggled, selectSaveStatus } from './attemptSlice';

async function setup() {
  const store = makeStore({ auth: { token: 'mock-u-student', hasLoggedOut: false } });
  const { startAttempt } = attemptApi.endpoints;
  const attempt = await store.dispatch(startAttempt.initiate('group2-screening')).unwrap();
  store.dispatch(attemptLoaded(attempt));
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  const choose = (optionId: string) =>
    store.dispatch(optionToggled({ questionId: 'g2q1', optionId, type: 'single' }));
  return { store, choose, attempt };
}

describe('autosave', () => {
  afterEach(() => vi.useRealTimers());

  it('sends one request for a burst of edits', async () => {
    let saves = 0;
    server.use(
      http.put('*/answers', () => {
        saves += 1;
      }),
    );
    const { store, choose } = await setup();
    choose('g2q1-o1');
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS / 2);
    choose('g2q1-o2');
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS);
    await vi.waitFor(() => expect(selectSaveStatus(store.getState())).toBe('saved'));
    expect(saves).toBe(1);
    expect(db.attempts[0]?.answers).toEqual({ g2q1: ['g2q1-o2'] });
  });

  it('retries after a server error', async () => {
    server.use(http.put('*/answers', () => HttpResponse.error(), { once: true }));
    const { store, choose } = await setup();
    choose('g2q1-o2');
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS);
    await vi.waitFor(() => expect(selectSaveStatus(store.getState())).toBe('error'));
    await vi.advanceTimersByTimeAsync(AUTOSAVE_RETRY_MS);
    await vi.waitFor(() => expect(selectSaveStatus(store.getState())).toBe('saved'));
    expect(db.attempts[0]?.answers).toEqual({ g2q1: ['g2q1-o2'] });
  });

  it('does not let an out-of-order save overwrite a newer one', async () => {
    const { store, attempt } = await setup();
    vi.useRealTimers();
    const save = (revision: number, optionId: string) =>
      store.dispatch(
        attemptApi.endpoints.saveAnswers.initiate({
          attemptId: attempt.id,
          revision,
          answers: { g2q1: [optionId] },
        }),
      );
    await save(2, 'g2q1-o2');
    await save(1, 'g2q1-o1');
    expect(db.attempts[0]?.answers).toEqual({ g2q1: ['g2q1-o2'] });
  });
});
