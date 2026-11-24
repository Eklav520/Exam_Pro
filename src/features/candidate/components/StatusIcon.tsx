import { Circle, CircleCheck, LoaderCircle } from 'lucide-react';
import type { ProgressStatus } from '../model/candidateSlice';

const config = {
  completed: {
    icon: CircleCheck,
    label: 'Completed',
    className: 'fill-green-600 text-white',
  },
  in_progress: { icon: LoaderCircle, label: 'In progress', className: 'text-blue-600' },
  not_started: { icon: Circle, label: 'Not started', className: 'text-muted' },
} as const;

export function StatusIcon({ status }: { status: ProgressStatus }) {
  const { icon: Icon, label, className } = config[status];
  return <Icon role="img" aria-label={label} className={`size-6 shrink-0 ${className}`} />;
}
