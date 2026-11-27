import type { TerminalDto } from '@/features/centres';
import type { MonitoredCandidate } from '../data/sample';

export interface Assignment {
  registrationNo: string;
  centreId: string;
  systemId: string;
}

/**
 * Computers at a centre nobody else is mapped to. Faulty ones are never offered.
 * `keep` is the candidate being edited, whose own PC stays available to them.
 */
export function freeSystems(
  terminals: TerminalDto[],
  candidates: MonitoredCandidate[],
  centreId: string,
  keep?: string,
): TerminalDto[] {
  const taken = new Set(
    candidates
      .filter((candidate) => candidate.registrationNo !== keep && candidate.systemId)
      .map((candidate) => candidate.systemId),
  );
  return terminals
    .filter(
      (terminal) =>
        terminal.centreId === centreId &&
        terminal.status !== 'FAULT' &&
        !taken.has(terminal.systemId),
    )
    .sort((a, b) => a.systemId.localeCompare(b.systemId));
}

/**
 * Seats every unmapped candidate at the first of their preferred centres with a free
 * computer. Earlier registrations go first. Those with no free seat stay unmapped.
 */
export function autoMap(
  candidates: MonitoredCandidate[],
  terminals: TerminalDto[],
): { assignments: Assignment[]; unplaced: MonitoredCandidate[] } {
  const working = candidates.map((candidate) => ({ ...candidate }));
  const assignments: Assignment[] = [];
  const unplaced: MonitoredCandidate[] = [];

  for (const candidate of working) {
    if (candidate.systemId) continue;
    const seat = candidate.preferences
      .map((centreId) => freeSystems(terminals, working, centreId)[0])
      .find((terminal) => terminal !== undefined);
    if (!seat) {
      unplaced.push(candidate);
      continue;
    }
    candidate.centreId = seat.centreId;
    candidate.systemId = seat.systemId;
    assignments.push({
      registrationNo: candidate.registrationNo,
      centreId: seat.centreId,
      systemId: seat.systemId,
    });
  }
  return { assignments, unplaced };
}

/** "1st", "2nd", "3rd". */
export const ordinal = (index: number) => ['1st', '2nd', '3rd'][index] ?? `${index + 1}th`;
