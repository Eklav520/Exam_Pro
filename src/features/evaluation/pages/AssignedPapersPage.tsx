import clsx from 'clsx';
import { Lock, PenLine, Search, Send } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { path } from '@/shared/config/paths';
import {
  Badge,
  Button,
  buttonClass,
  Card,
  ConfirmDialog,
  DataTable,
  PageHeader,
  ProgressBar,
  useToast,
  type Column,
} from '@/shared/ui';
import type { AssignedScript, ScriptStatus } from '../data/assigned';
import { loadDraft } from '../model/evaluationDraft';
import { countScripts, evaluatedScriptsSent, selectAssignedScripts } from '../model/assignedSlice';

const statuses: Record<ScriptStatus, { label: string; tone: 'warning' | 'info' | 'success' }> = {
  pending: { label: 'Pending', tone: 'warning' },
  evaluated: { label: 'Evaluated', tone: 'info' },
  sent: { label: 'Sent', tone: 'success' },
};

type View = 'all' | ScriptStatus;
const ALL_CENTRES = 'all';

const columns: Column<AssignedScript>[] = [
  { header: '#', cell: (_row, index) => <span className="text-muted">{index + 1}</span> },
  {
    header: 'Registration No.',
    cell: (row) => <span className="font-semibold tabular-nums">{row.registrationNo}</span>,
  },
  {
    header: 'Examination',
    cell: (row) => (
      <span className="block">
        <span className="block">{row.exam}</span>
        <span className="text-xs text-muted">{row.paperSet}</span>
      </span>
    ),
  },
  { header: 'Centre', cell: (row) => row.centre },
  { header: 'Assigned On', cell: (row) => <span className="text-muted">{row.assignedOn}</span> },
  {
    header: 'Marks',
    align: 'center',
    cell: (row) =>
      row.marks === null ? (
        <span className="text-muted">–</span>
      ) : (
        <span className="tabular-nums">
          <span className="font-semibold">{row.marks}</span>
          <span className="text-muted"> / {row.maxMarks}</span>
        </span>
      ),
  },
  {
    header: 'Status',
    align: 'center',
    cell: ({ status }) => <Badge tone={statuses[status].tone}>{statuses[status].label}</Badge>,
  },
  {
    header: 'Action',
    align: 'right',
    cell: (row) => {
      if (row.status === 'pending') {
        // Started earlier and saved for a break.
        const draft = loadDraft(row.registrationNo);
        return (
          <span className="inline-flex items-center gap-3">
            {draft && <span className="text-xs text-muted">Saved {draft.savedAt}</span>}
            <Link
              to={path.adminWorkspace}
              aria-label={`${draft ? 'Resume' : 'Evaluate'} ${row.registrationNo}`}
              className={buttonClass(draft ? 'outline' : 'primary', 'sm')}
            >
              <PenLine aria-hidden className="size-4" />
              {draft ? 'Resume' : 'Evaluate'}
            </Link>
          </span>
        );
      }
      if (row.status === 'evaluated') {
        return <span className="text-sm text-muted">Ready to send</span>;
      }
      return (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted">
          <Lock aria-hidden className="size-3.5" />
          Locked
        </span>
      );
    },
  },
];

export function AssignedPapersPage() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const scripts = useAppSelector(selectAssignedScripts);
  const counts = countScripts(scripts);
  const [isConfirming, setIsConfirming] = useState(false);
  const [view, setView] = useState<View>('all');
  const [centre, setCentre] = useState(ALL_CENTRES);
  const [search, setSearch] = useState('');

  const done = counts.evaluated + counts.sent;
  const percent = counts.assigned > 0 ? Math.round((done / counts.assigned) * 100) : 0;
  const centres = [...new Set(scripts.map((script) => script.centre))].sort();
  const term = search.trim().toLowerCase();
  const rows = scripts.filter(
    (script) =>
      (view === 'all' || script.status === view) &&
      (centre === ALL_CENTRES || script.centre === centre) &&
      script.registrationNo.toLowerCase().includes(term),
  );

  const views: { id: View; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.assigned },
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'evaluated', label: 'Evaluated', count: counts.evaluated },
    { id: 'sent', label: 'Sent', count: counts.sent },
  ];

  return (
    <>
      <PageHeader
        title="Assigned Answer Papers"
        description="Evaluate the answer papers allocated to you, then send the marks to the Higher Official."
      />

      <Card className="mb-5 flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="min-w-64 flex-1">
          <p className="mb-1.5 text-sm">
            <span className="font-semibold">
              {done} of {counts.assigned} papers evaluated
            </span>
            <span className="text-muted"> · {counts.pending} pending</span>
          </p>
          <ProgressBar label="Evaluation progress" percent={percent} />
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted">
            {counts.evaluated > 0
              ? `${counts.evaluated} ready to send`
              : 'Nothing waiting to be sent'}
          </p>
          <Button disabled={counts.evaluated === 0} onClick={() => setIsConfirming(true)}>
            <Send aria-hidden className="size-4" />
            Send to Higher Official
          </Button>
        </div>
      </Card>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Show answer papers"
          className="inline-flex rounded-lg border border-line bg-surface p-1"
        >
          {views.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={view === item.id}
              onClick={() => setView(item.id)}
              className={clsx(
                'flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors',
                view === item.id ? 'bg-brand-700 text-white' : 'text-ink hover:bg-canvas',
              )}
            >
              {item.label}
              <span
                className={clsx(
                  'rounded-full px-2 text-xs tabular-nums',
                  view === item.id ? 'bg-white/20' : 'bg-line/70',
                )}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Centre"
            value={centre}
            onChange={(event) => setCentre(event.target.value)}
            className="control w-40"
          >
            <option value={ALL_CENTRES}>All Centres</option>
            {centres.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <div className="relative w-64">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              aria-label="Search registration number"
              placeholder="Search registration no."
              className="control pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
      </div>

      <DataTable
        caption="Assigned answer papers"
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.registrationNo}
        emptyMessage={
          scripts.length === 0
            ? 'No answer papers are assigned to you yet.'
            : 'No answer papers match these filters.'
        }
      />

      <ConfirmDialog
        open={isConfirming}
        title={`Send ${counts.evaluated} evaluated ${counts.evaluated === 1 ? 'paper' : 'papers'}?`}
        confirmLabel="Send"
        onConfirm={() => {
          dispatch(evaluatedScriptsSent());
          toast(
            `${counts.evaluated} papers are sent to the Higher Official. Not saved to a server yet.`,
          );
          setIsConfirming(false);
        }}
        onCancel={() => setIsConfirming(false)}
      >
        The Higher Official will review the marks. You cannot change them after sending.
      </ConfirmDialog>
    </>
  );
}
