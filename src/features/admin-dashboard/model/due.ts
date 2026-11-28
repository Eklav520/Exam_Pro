export type DueTone = 'neutral' | 'warning' | 'danger';

const DAY_MS = 86_400_000;
const days = (count: number) => `${count} ${count === 1 ? 'day' : 'days'}`;

/** How close a yyyy-mm-dd deadline is, counted in whole local days. */
export function describeDue(day: string, today = new Date()): { label: string; tone: DueTone } {
  const due = new Date(`${day}T00:00`);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  // Rounded, so a daylight-saving change cannot shift the count by one.
  const left = Math.round((due.getTime() - start.getTime()) / DAY_MS);

  if (left < 0) return { label: `Overdue by ${days(-left)}`, tone: 'danger' };
  if (left === 0) return { label: 'Due today', tone: 'warning' };
  if (left <= 3) return { label: `Due in ${days(left)}`, tone: 'warning' };
  return { label: `${days(left)} left`, tone: 'neutral' };
}
