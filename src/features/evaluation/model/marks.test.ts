import { getMarksError, toMarks } from './marks';

describe('marks', () => {
  it.each(['0', '18', '17.5', '20'])('accepts %s of 20', (input) => {
    expect(getMarksError(input, 20)).toBeUndefined();
    expect(toMarks(input, 20)).toBe(Number(input));
  });

  it.each(['', ' ', '-1', '20.5', 'abc'])('rejects "%s" and counts it as zero', (input) => {
    expect(getMarksError(input, 20)).toBeDefined();
    expect(toMarks(input, 20)).toBe(0);
  });
});
