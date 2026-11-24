import { formatCountdown, formatDuration } from './format';

describe('format', () => {
  it('formats durations', () => {
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(60)).toBe('1 hr');
    expect(formatDuration(90)).toBe('1 hr 30 min');
  });

  it('formats countdowns and never goes negative', () => {
    expect(formatCountdown(61_000)).toBe('01:01');
    expect(formatCountdown(3_661_000)).toBe('01:01:01');
    expect(formatCountdown(-5)).toBe('00:00');
  });
});
