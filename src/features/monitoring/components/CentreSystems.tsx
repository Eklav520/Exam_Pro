import clsx from 'clsx';
import { Monitor } from 'lucide-react';
import type { CentreDto, TerminalDto } from '@/features/centres';
import { Badge } from '@/shared/ui';
import {
  shortName,
  statusOrder as order,
  terminalStatuses as statuses,
} from '../model/terminalStatus';

type Status = TerminalDto['status'];

interface CentreSystemsProps {
  centre: CentreDto;
  terminals: TerminalDto[];
  /** Id for the heading, so a dialog can be named by it. */
  headingId: string;
}

/** One centre's computers at a glance, coloured by their latest reported status. */
export function CentreSystems({ centre, terminals, headingId }: CentreSystemsProps) {
  const count = (status: Status) => terminals.filter((item) => item.status === status).length;
  const faults = count('FAULT');
  // A centre is active while any of its machines is reporting in.
  const isActive = terminals.some((item) => item.status !== 'FAULT');
  const sorted = [...terminals].sort((a, b) => a.systemId.localeCompare(b.systemId));

  return (
    <section aria-labelledby={headingId}>
      <div className="mb-1 flex flex-wrap items-center gap-3">
        <h2 id={headingId} className="text-lg font-bold">
          {centre.name} – Live System Monitoring
        </h2>
        <span className="ml-auto">
          <Badge tone={isActive ? 'success' : 'danger'}>
            {isActive ? 'Centre Active' : 'Centre Offline'}
          </Badge>
        </span>
      </div>
      <p className="mb-4 text-sm text-muted">
        {[centre.city, centre.district && `${centre.district} District`, centre.state]
          .filter(Boolean)
          .join(', ')}{' '}
        · {terminals.length} registered computers
        {faults > 0 && (
          <span className="font-semibold text-danger">
            {' '}
            · {faults} need{faults === 1 ? 's' : ''} attention
          </span>
        )}
      </p>
      {terminals.length === 0 ? (
        <p className="py-6 text-center text-muted">No computers registered at this centre yet.</p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2.5">
          {sorted.map((terminal) => {
            const status = statuses[terminal.status];
            return (
              <li
                key={terminal._id}
                title={`${terminal.systemId} · Seat ${terminal.seatNumber} · ${terminal.ipv4Address}`}
                className={clsx(
                  'flex flex-col items-center gap-0.5 rounded-lg border px-2 py-2 text-center',
                  status.tile,
                )}
              >
                <Monitor aria-hidden className={clsx('size-5', status.icon)} />
                <span className="font-semibold">{shortName(terminal.systemId)}</span>
                <span className="text-xs text-muted">{status.label}</span>
              </li>
            );
          })}
        </ul>
      )}
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted" aria-label="Legend">
        {order.map((key) => (
          <li key={key} className="flex items-center gap-2">
            <span aria-hidden className={clsx('size-4 rounded-full', statuses[key].dot)} />
            {statuses[key].label} ({count(key)})
          </li>
        ))}
      </ul>
    </section>
  );
}
