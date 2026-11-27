import clsx from 'clsx';
import { ChevronDown, Eye, Pencil, Search, SlidersHorizontal, Wand2, X } from 'lucide-react';
import { useId, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useGetCentresQuery, useGetTerminalsQuery } from '@/features/centres';
import { SAMPLE_EXAM, sampleExams } from '@/features/question-papers';
import {
  Badge,
  Button,
  Card,
  DataTable,
  IconButton,
  PageError,
  PageLoader,
  ProgressBar,
  SelectField,
  useToast,
  type Column,
} from '@/shared/ui';
import { SAMPLE_EXAM_DATE } from '../data/sample';
import { examStatuses, type SeatedCandidate } from '../model/candidates';
import { autoMap, ordinal } from '../model/mapping';
import { candidatesMapped, candidateUpdated, selectCandidates } from '../model/mappingSlice';
import { shortName, terminalStatuses } from '../model/terminalStatus';
import { MapCandidateDialog } from './MapCandidateDialog';
import { StudentSeatDialog } from './StudentSeatDialog';

const ALL = 'all';
const REFRESH_MS = 30_000;

const shifts = [
  { value: ALL, label: 'All Shifts' },
  { value: '1', label: 'Shift 1 (Morning)' },
  { value: '2', label: 'Shift 2 (Afternoon)' },
];

type View = 'all' | 'mapped' | 'unmapped' | 'faulty';

const views: { id: View; label: string; tone: string }[] = [
  { id: 'all', label: 'All', tone: 'bg-line text-ink' },
  { id: 'mapped', label: 'Mapped', tone: 'bg-success-soft text-success' },
  { id: 'unmapped', label: 'Not Mapped', tone: 'bg-warning-soft text-warning' },
  { id: 'faulty', label: 'Faulty PC', tone: 'bg-danger-soft text-danger-strong' },
];

const inView: Record<View, (row: SeatedCandidate) => boolean> = {
  all: () => true,
  mapped: (row) => Boolean(row.systemId),
  unmapped: (row) => !row.systemId,
  faulty: (row) => row.terminal?.status === 'FAULT',
};

const noFilters = { state: ALL, district: ALL, centre: ALL, status: ALL };

const unique = (values: (string | undefined)[]) =>
  [...new Set(values.filter((value): value is string => Boolean(value)))].sort();

/**
 * Registered candidates with their preferred centres, and the centre and computer the
 * Admin maps them to. Once mapped, each row also shows that computer's live status.
 */
export function CandidatesView() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const dateId = useId();
  const candidates = useAppSelector(selectCandidates);
  const centresQuery = useGetCentresQuery();
  const terminalsQuery = useGetTerminalsQuery(undefined, { pollingInterval: REFRESH_MS });
  const [exam, setExam] = useState(SAMPLE_EXAM);
  const [date, setDate] = useState(SAMPLE_EXAM_DATE);
  // Candidates do not carry a shift yet; the choice is kept for when they do.
  const [shift, setShift] = useState(ALL);
  const [view, setView] = useState<View>('all');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(noFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const set = (change: Partial<typeof noFilters>) => setFilters({ ...filters, ...change });

  const error = centresQuery.error ?? terminalsQuery.error;
  if (error) {
    return (
      <PageError
        error={error}
        onRetry={() => {
          void centresQuery.refetch();
          void terminalsQuery.refetch();
        }}
      />
    );
  }
  if (!centresQuery.data || !terminalsQuery.data) return <PageLoader label="Loading candidates…" />;

  const centres = centresQuery.data.centres;
  const terminals = terminalsQuery.data.terminals;
  const centreById = (id: string | null | undefined) => centres.find(({ _id }) => _id === id);
  // Only the sample exam session has candidates until registrations come from the server.
  const inSession = exam === SAMPLE_EXAM && date === SAMPLE_EXAM_DATE;
  const seated: SeatedCandidate[] = inSession
    ? candidates.map((candidate) => ({
        ...candidate,
        centre: centreById(candidate.centreId),
        terminal: terminals.find(({ systemId }) => systemId === candidate.systemId),
      }))
    : [];

  // Each level offers only what lies under the one chosen above it.
  const inState = centres.filter(({ state }) => filters.state === ALL || state === filters.state);
  const inDistrict = inState.filter(
    ({ district }) => filters.district === ALL || district === filters.district,
  );
  const activeFilters = Object.values(filters).filter((value) => value !== ALL).length;

  const term = search.trim().toLowerCase();
  const matching = seated.filter((row) => {
    // Until mapped, a candidate counts where they most want to write.
    const place = row.centre ?? centreById(row.preferences[0]);
    return (
      (filters.state === ALL || place?.state === filters.state) &&
      (filters.district === ALL || place?.district === filters.district) &&
      (filters.centre === ALL || place?._id === filters.centre) &&
      (filters.status === ALL || row.status === filters.status) &&
      `${row.name} ${row.registrationNo} ${row.mobile}`.toLowerCase().includes(term)
    );
  });
  const rows = matching.filter(inView[view]);

  const mapped = seated.filter((row) => row.systemId).length;
  const unmapped = seated.length - mapped;
  const percent = seated.length === 0 ? 0 : Math.round((mapped / seated.length) * 100);
  const viewing = seated.find((row) => row.registrationNo === viewingId);
  const editing = candidates.find((row) => row.registrationNo === editingId);

  const handleAutoMap = () => {
    const { assignments, unplaced } = autoMap(candidates, terminals);
    dispatch(candidatesMapped(assignments));
    toast(
      unplaced.length === 0
        ? `${assignments.length} candidates are mapped by their centre preferences.`
        : `${assignments.length} mapped. ${unplaced.length} have no free seat at their preferred centres; map them by hand.`,
    );
  };

  const columns: Column<SeatedCandidate>[] = [
    { header: '#', cell: (_row, index) => index + 1 },
    {
      header: 'Candidate',
      cell: (row) => (
        <span>
          <span className="block font-medium">{row.name}</span>
          <span className="text-xs text-muted">
            {row.registrationNo} · {row.mobile}
          </span>
        </span>
      ),
    },
    {
      header: 'Centre Preferences',
      cell: (row) => (
        <ol className="text-xs">
          {row.preferences.map((id, index) => (
            <li key={id} className={id === row.centreId ? 'font-semibold' : 'text-muted'}>
              {ordinal(index)}: {centreById(id)?.name ?? id}
            </li>
          ))}
        </ol>
      ),
    },
    {
      header: 'Mapped Centre',
      cell: (row) =>
        row.centre ? (
          <span>
            <span className="block">{row.centre.name}</span>
            <span className="text-xs text-muted">
              {row.centre.city}, {row.centre.district ?? row.centre.state}
            </span>
          </span>
        ) : (
          <Badge tone="warning">Not Mapped</Badge>
        ),
    },
    {
      header: 'System / Seat',
      cell: (row) =>
        row.systemId ? (
          <span>
            <span className="block">{shortName(row.systemId)}</span>
            <span className="text-xs text-muted">Seat {row.terminal?.seatNumber ?? '–'}</span>
          </span>
        ) : (
          '–'
        ),
    },
    {
      header: 'PC Status',
      align: 'center',
      cell: ({ terminal }) =>
        terminal ? (
          <Badge tone={terminalStatuses[terminal.status].tone}>
            {terminalStatuses[terminal.status].label}
          </Badge>
        ) : (
          '–'
        ),
    },
    {
      header: 'Exam Status',
      align: 'center',
      cell: ({ status }) => (
        <Badge tone={examStatuses[status].tone}>{examStatuses[status].label}</Badge>
      ),
    },
    {
      header: 'Actions',
      align: 'center',
      cell: (row) => (
        <span className="inline-flex gap-1">
          <IconButton
            icon={Eye}
            label={`View ${row.name}`}
            onClick={() => setViewingId(row.registrationNo)}
          />
          <IconButton
            icon={Pencil}
            label={`Map ${row.name}`}
            onClick={() => setEditingId(row.registrationNo)}
          />
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* The exam session being mapped, and how far along it is. */}
      <Card className="flex flex-wrap items-end gap-x-4 gap-y-3 p-4">
        <SelectField
          label="Examination"
          value={exam}
          options={sampleExams}
          onChange={setExam}
          className="min-w-56 flex-[2]"
        />
        <div className="w-40">
          <label htmlFor={dateId} className="mb-1 block text-xs font-medium">
            Exam Date
          </label>
          <input
            id={dateId}
            type="date"
            className="control"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
        <SelectField
          label="Shift"
          value={shift}
          options={shifts}
          onChange={setShift}
          className="w-48"
        />
        <div className="min-w-56 flex-[1.5]">
          <p className="mb-1.5 text-xs font-medium">
            {mapped} of {seated.length} candidates mapped
          </p>
          <ProgressBar label="Candidates mapped" percent={percent} />
        </div>
        <Button disabled={unmapped === 0} onClick={handleAutoMap}>
          <Wand2 aria-hidden className="size-4" />
          Auto-map by Preference ({unmapped})
        </Button>
      </Card>

      {/* Which candidates to show. The counts double as the screen's summary. */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="group"
          aria-label="Show candidates"
          className="flex flex-wrap gap-1 rounded-xl bg-table-head p-1"
        >
          {views.map(({ id, label, tone }) => {
            const isActive = view === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setView(id)}
                className={clsx(
                  'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold',
                  isActive ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink',
                )}
              >
                {label}
                <span className={clsx('rounded-full px-2 text-xs tabular-nums', tone)}>
                  {matching.filter(inView[id]).length}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative ml-auto min-w-56 flex-1 sm:max-w-xs">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            aria-label="Search candidates"
            placeholder="Name, registration no. or mobile"
            className="control pl-9"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Button
          variant="secondary"
          aria-expanded={showFilters}
          aria-controls="candidate-filters"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal aria-hidden className="size-4" />
          Filters
          {activeFilters > 0 && (
            <span className="rounded-full bg-brand-700 px-1.5 text-xs text-white">
              {activeFilters}
            </span>
          )}
          <ChevronDown
            aria-hidden
            className={clsx('size-4 transition-transform', showFilters && 'rotate-180')}
          />
        </Button>
      </div>

      {showFilters && (
        <div
          id="candidate-filters"
          className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-canvas/60 p-4"
        >
          <SelectField
            label="State"
            value={filters.state}
            options={[{ value: ALL, label: 'All States' }, ...unique(centres.map((c) => c.state))]}
            onChange={(state) => set({ state, district: ALL, centre: ALL })}
            className="min-w-40 flex-1"
          />
          <SelectField
            label="District"
            value={filters.district}
            options={[
              { value: ALL, label: 'All Districts' },
              ...unique(inState.map((c) => c.district)),
            ]}
            onChange={(district) => set({ district, centre: ALL })}
            className="min-w-40 flex-1"
          />
          <SelectField
            label="Centre"
            value={filters.centre}
            options={[
              { value: ALL, label: 'All Centres' },
              ...inDistrict.map(({ _id, name, city }) => ({
                value: _id,
                label: `${name} – ${city}`,
              })),
            ]}
            onChange={(centre) => set({ centre })}
            className="min-w-40 flex-1"
          />
          <SelectField
            label="Exam Status"
            value={filters.status}
            options={[
              { value: ALL, label: 'All' },
              ...Object.entries(examStatuses).map(([value, { label }]) => ({ value, label })),
            ]}
            onChange={(status) => set({ status })}
            className="min-w-40 flex-1"
          />
          <Button
            variant="ghost"
            disabled={activeFilters === 0}
            onClick={() => setFilters(noFilters)}
          >
            <X aria-hidden className="size-4" />
            Clear
          </Button>
        </div>
      )}

      <DataTable
        dense
        caption="Candidates"
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.registrationNo}
        emptyMessage={
          inSession
            ? 'No candidates match these filters.'
            : 'No candidates are registered for this exam session yet.'
        }
      />
      <p className="text-xs text-muted">
        Auto-map seats each candidate at their 1st choice centre, then their 2nd and 3rd when it is
        full. Faulty computers are never used.
      </p>

      {viewing && <StudentSeatDialog candidate={viewing} onClose={() => setViewingId(null)} />}
      {editing && (
        <MapCandidateDialog
          candidate={editing}
          candidates={candidates}
          centres={centres}
          terminals={terminals}
          onClose={() => setEditingId(null)}
          onSave={(changes) => {
            dispatch(candidateUpdated({ registrationNo: editing.registrationNo, changes }));
            toast(
              changes.systemId
                ? `${changes.name ?? editing.name} is mapped to ${shortName(changes.systemId)}. Not saved to a server yet.`
                : `${changes.name ?? editing.name} is saved without a seat. Not saved to a server yet.`,
            );
            setEditingId(null);
          }}
        />
      )}
    </div>
  );
}
