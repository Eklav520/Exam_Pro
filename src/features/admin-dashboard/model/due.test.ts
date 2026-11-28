import { describe, expect, it } from 'vitest';
import { describeDue } from './due';

const today = new Date(2026, 10, 28, 15, 30);

describe('describeDue', () => {
  it.each([
    ['2026-11-25', 'Overdue by 3 days', 'danger'],
    ['2026-11-27', 'Overdue by 1 day', 'danger'],
    ['2026-11-28', 'Due today', 'warning'],
    ['2026-11-29', 'Due in 1 day', 'warning'],
    ['2026-12-01', 'Due in 3 days', 'warning'],
    ['2026-12-02', '4 days left', 'neutral'],
    ['2026-12-31', '33 days left', 'neutral'],
  ])('describes %s', (day, label, tone) => {
    expect(describeDue(day, today)).toEqual({ label, tone });
  });
});
