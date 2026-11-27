import type { TerminalDto } from '@/features/centres';

type Status = TerminalDto['status'];

/** How each computer state looks: tile colours in the grid, badge tone in tables. */
export const terminalStatuses: Record<
  Status,
  {
    label: string;
    tile: string;
    icon: string;
    dot: string;
    tone: 'info' | 'success' | 'warning' | 'danger';
  }
> = {
  IN_EXAM: {
    label: 'In Exam',
    tile: 'bg-blue-50 border-blue-100',
    icon: 'text-blue-700',
    dot: 'bg-blue-100',
    tone: 'info',
  },
  ONLINE: {
    label: 'Online',
    tile: 'bg-emerald-50 border-emerald-100',
    icon: 'text-emerald-700',
    dot: 'bg-emerald-100',
    tone: 'success',
  },
  IDLE: {
    label: 'Idle',
    tile: 'bg-amber-50 border-amber-100',
    icon: 'text-amber-700',
    dot: 'bg-amber-100',
    tone: 'warning',
  },
  FAULT: {
    label: 'Fault',
    tile: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    dot: 'bg-red-100',
    tone: 'danger',
  },
};

export const statusOrder: Status[] = ['IN_EXAM', 'ONLINE', 'IDLE', 'FAULT'];

/** "PC-08" from "CEN-D-PC-08". */
export const shortName = (systemId: string) => /PC-\d+$/.exec(systemId)?.[0] ?? systemId;
