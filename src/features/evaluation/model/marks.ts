/** Returns a message when the marks cannot be saved. */
export function getMarksError(input: string, maxMarks: number): string | undefined {
  if (input.trim() === '') return 'Enter the marks';
  const marks = Number(input);
  if (!Number.isFinite(marks) || marks < 0 || marks > maxMarks) return `Use 0 to ${maxMarks}`;
  return undefined;
}

/** Marks that count towards a total; invalid or missing input counts as zero. */
export function toMarks(input: string | undefined, maxMarks: number): number {
  return input !== undefined && getMarksError(input, maxMarks) === undefined ? Number(input) : 0;
}
