import clsx from 'clsx';
import { Monitor, X } from 'lucide-react';
import { useState } from 'react';
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
  const [selected, setSelected] = useState<TerminalDto | null>(null);
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
              <li key={terminal._id} className="group relative">
                <button
                  type="button"
                  onClick={() => setSelected(terminal)}
                  className={clsx(
                    'flex w-full cursor-pointer flex-col items-center gap-0.5 rounded-lg border px-2 py-2 text-center transition hover:ring-2 hover:ring-brand-500/50',
                    status.tile,
                    selected?._id === terminal._id && 'ring-2 ring-brand-700',
                  )}
                >
                  <Monitor aria-hidden className={clsx('size-5', status.icon)} />
                  <span className="font-semibold">{shortName(terminal.systemId)}</span>
                  <span className="text-xs text-muted">{status.label}</span>
                </button>
                <div
                  role="tooltip"
                  className="pointer-events-none invisible absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-left text-xs text-white opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100"
                >
                  <p className="font-bold text-cyan-300">{terminal.systemId}</p>
                  <p className="mt-1 text-slate-300">Seat: {terminal.seatNumber}</p>
                  <p className="font-mono text-slate-300">IPv4: {terminal.ipv4Address}</p>
                  <p className="font-mono text-slate-300">MAC: {terminal.macAddress}</p>
                  <p className="mt-1 text-slate-400">Status: {status.label}</p>
                </div>
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
      {selected && (
        <div className="mt-4 rounded-xl border border-border bg-slate-50 p-4 text-sm">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-bold text-ink">
              {selected.systemId} — Terminal Details
            </h3>
            <button
              type="button"
              aria-label="Close terminal details"
              onClick={() => setSelected(null)}
              className="rounded p-1 text-muted hover:bg-slate-200 hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="grid gap-2 text-xs sm:grid-cols-3">
            <div>
              <span className="text-muted">Seat Number:</span>{' '}
              <span className="font-semibold text-ink">{selected.seatNumber}</span>
            </div>
            <div>
              <span className="text-muted">IPv4 Address:</span>{' '}
              <span className="font-mono font-semibold text-ink">{selected.ipv4Address}</span>
            </div>
            <div>
              <span className="text-muted">MAC Address:</span>{' '}
              <span className="font-mono font-semibold text-ink">{selected.macAddress}</span>
            </div>
            <div>
              <span className="text-muted">Status:</span>{' '}
              <span className="font-semibold text-ink">{statuses[selected.status].label}</span>
            </div>
            <div>
              <span className="text-muted">Focus Violations:</span>{' '}
              <span className="font-semibold text-ink">{selected.focusViolations ?? 0}</span>
            </div>
            <div>
              <span className="text-muted">Centre Code:</span>{' '}
              <span className="font-semibold text-ink">{selected.centreCode}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
