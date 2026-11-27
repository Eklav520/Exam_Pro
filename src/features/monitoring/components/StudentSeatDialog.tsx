import clsx from 'clsx';
import { Monitor, X } from 'lucide-react';
import { useId } from 'react';
import { Badge, IconButton, Modal } from '@/shared/ui';
import { shortName, terminalStatuses } from '../model/terminalStatus';
import { examStatuses, type SeatedCandidate } from '../model/candidates';

interface StudentSeatDialogProps {
  candidate: SeatedCandidate;
  onClose: () => void;
}

/** One candidate: where they sit and how their computer is doing right now. */
export function StudentSeatDialog({ candidate, onClose }: StudentSeatDialogProps) {
  const titleId = useId();
  const { centre, terminal } = candidate;
  const status = terminal ? terminalStatuses[terminal.status] : null;
  const exam = examStatuses[candidate.status];

  const facts = [
    ['Registration No.', candidate.registrationNo],
    ['Mobile', candidate.mobile],
    ['Email', candidate.email],
    ['Paper Set', candidate.paperSet],
    ['State', centre?.state ?? '–'],
    ['District', centre?.district ?? '–'],
    ['Centre', centre ? `${centre.name} (${centre.code}), ${centre.city}` : 'Not mapped'],
    ['System ID', candidate.systemId ?? 'Not mapped'],
    ['Seat', terminal?.seatNumber ?? '–'],
    ['IP Address', terminal?.ipv4Address ?? '–'],
    ['Submitted At', candidate.submittedAt ?? '–'],
  ] as const;

  return (
    <Modal
      open
      titleId={titleId}
      onClose={onClose}
      className="max-w-2xl! backdrop:backdrop-blur-sm"
    >
      <div className="mb-4 flex items-start gap-3">
        <div>
          <h2 id={titleId} className="text-lg font-bold">
            {candidate.name}
          </h2>
          <p className="text-sm text-muted">Seat allocation and live system status</p>
        </div>
        <IconButton icon={X} label="Close" className="ml-auto" onClick={onClose} />
      </div>
      <div className="grid gap-5 sm:grid-cols-[11rem_1fr]">
        <div
          className={clsx(
            'flex flex-col items-center justify-center gap-1 rounded-xl border p-4 text-center',
            status?.tile ?? 'border-line',
          )}
        >
          <Monitor aria-hidden className={clsx('size-8', status?.icon ?? 'text-muted')} />
          <span className="text-lg font-bold">
            {candidate.systemId ? shortName(candidate.systemId) : 'No PC'}
          </span>
          <span className="text-sm">
            {status?.label ?? (candidate.systemId ? 'Not registered' : 'Not mapped yet')}
          </span>
          <span className="mt-2">
            <Badge tone={exam.tone}>{exam.label}</Badge>
          </span>
        </div>
        <dl className="divide-y divide-line text-sm">
          {facts.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[8.5rem_1fr] gap-2 py-1.5">
              <dt className="text-muted">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      {terminal?.status === 'FAULT' && candidate.status === 'attended' && (
        <p role="alert" className="mt-4 rounded-lg bg-danger-soft px-4 py-3 text-sm">
          This candidate&apos;s computer has a fault while the exam is in progress. Move them to a
          spare system at {centre?.name ?? 'the centre'}.
        </p>
      )}
    </Modal>
  );
}
