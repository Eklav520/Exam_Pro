import type { CentreDto, TerminalDto } from '@/features/centres';
import type { CandidateStatus, MonitoredCandidate } from '../data/sample';

export const examStatuses: Record<
  CandidateStatus,
  { label: string; tone: 'neutral' | 'success' | 'info' | 'danger' }
> = {
  registered: { label: 'Registered', tone: 'neutral' },
  submitted: { label: 'Submitted', tone: 'success' },
  attended: { label: 'Attended', tone: 'info' },
  not_attended: { label: 'Not Attended', tone: 'danger' },
};

/** A candidate with where they sit and how their computer is doing. */
export interface SeatedCandidate extends MonitoredCandidate {
  centre: CentreDto | undefined;
  terminal: TerminalDto | undefined;
}
