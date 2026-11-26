export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

/** 3661000 -> "01:01:01", 61000 -> "01:01" */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const pad = (n: number) => String(n).padStart(2, '0');
  const hours = Math.floor(total / 3600);
  const clock = `${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
  return hours > 0 ? `${pad(hours)}:${clock}` : clock;
}

/** Always with hours: 61000 -> "00:01:01" */
export function formatClock(ms: number): string {
  const clock = formatCountdown(ms);
  return clock.length > 5 ? clock : `00:${clock}`;
}

const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}

const dateOnly = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' });

/** "12 Mar 2026" from "2026-03-12", read as a local date so it never shifts a day. */
export function formatDate(day: string): string {
  return dateOnly.format(new Date(`${day}T00:00`));
}

export function formatNumber(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
