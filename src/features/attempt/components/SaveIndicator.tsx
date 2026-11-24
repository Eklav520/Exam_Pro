import type { SaveStatus } from '../model/attemptSlice';

const labels: Record<SaveStatus, string> = {
  saved: 'All answers saved',
  saving: 'Saving…',
  error: 'Not saved. Retrying…',
};

export function SaveIndicator({ status }: { status: SaveStatus }) {
  return (
    <span
      role="status"
      className={status === 'error' ? 'text-sm text-danger' : 'text-sm text-muted'}
    >
      {labels[status]}
    </span>
  );
}
