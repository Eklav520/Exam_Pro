import { CircleAlert, Eye, MapPinned, Pencil, Search, UserCheck, Users, Wand2 } from 'lucide-react';
import { useId, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useGetCentresQuery, useGetTerminalsQuery } from '@/features/centres';
import { SAMPLE_EXAM, sampleExams } from '@/features/question-papers';
import {
  Badge,
  Button,
  DataTable,
  FilterBar,
  IconButton,
  PageError,
  PageLoader,
  SelectField,
  StatCard,
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

const initialFilters = {
  exam: SAMPLE_EXAM,
  date: SAMPLE_EXAM_DATE,
  state: ALL,
  district: ALL,
  centre: ALL,
  mapping: ALL,
  status: ALL,
};

const mappingOptions = [
  { value: ALL, label: 'All' },
  { value: 'mapped', label: 'Mapped' },
  { value: 'unmapped', label: 'Not Mapped' },
];

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
  const [filters, setFilters] = useState(initialFilters);
  const [applied, setApplied] = useState(initialFilters);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const set = (change: Partial<typeof initialFilters>) => setFilters({ ...filters, ...change });

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
  const seated: SeatedCandidate[] = candidates.map((candidate) => ({
    ...candidate,
    centre: centreById(candidate.centreId),
    terminal: terminals.find(({ systemId }) => systemId === candidate.systemId),
  }));

  // Each level offers only what lies under the one chosen above it.
  const inState = centres.filter(({ state }) => filters.state === ALL || state === filters.state);
  const inDistrict = inState.filter(
    ({ district }) => filters.district === ALL || district === filters.district,
  );

  const rows = seated.filter((row) => {
    // Until mapped, a candidate counts where they most want to write.
    const place = row.centre ?? centreById(row.preferences[0]);
  return (
      applied.exam === SAMPLE_EXAM &&
      applied.date === SAMPLE_EXAM_DATE &&
      (applied.state === ALL || place?.state === applied.state) &&
      (applied.district === ALL || place?.district === applied.district) &&
      (applied.centre === ALL || place?._id === applied.centre) &&
      (applied.mapping === ALL || (applied.mapping === 'mapped') === Boolean(row.systemId)) &&
      (applied.status === ALL || row.status === applied.status)
    );
  });

  const mapped = candidates.filter((candidate) => candidate.systemId).length;
  const unmapped = candidates.length - mapped;
  const onFaultyPc = seated.filter((row) => row.terminal?.status === 'FAULT').length;
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

  const [shift, setShift] = useState('ALL');
  return (
    <>
      <FilterBar label="Filter candidates" onSubmit={() => setApplied(filters)}>
        <SelectField
          label="Examination"
          value={filters.exam}
          options={sampleExams}
          onChange={(exam) => set({ exam })}
          className="min-w-0 flex-[1.2]"
        />
        <div className="w-36 shrink-0">
          <label htmlFor={dateId} className="mb-1 block text-xs font-medium">
            Exam Date
          </label>
          <input
            id={dateId}
            type="date"
            className="control"
            value={filters.date}
            onChange={(event) => set({ date: event.target.value })}
          />
        </div>
        <SelectField
          label="Shift"
          value={shift}
          options={[
            { value: 'ALL', label: 'All Shifts' },
            { value: '1', label: 'Shift 1' },
            { value: '2', label: 'Shift 2' },
          ]}
          onChange={setShift}
          className="min-w-0 flex-[0.65]"
        />
        <SelectField
          label="State"
          value={filters.state}
          options={[{ value: ALL, label: 'All States' }, ...unique(centres.map((c) => c.state))]}
          onChange={(state) => set({ state, district: ALL, centre: ALL })}
          className="min-w-0 flex-[0.75]"
        />
        <SelectField
          label="District"
          value={filters.district}
          options={[
            { value: ALL, label: 'All Districts' },
            ...unique(inState.map((c) => c.district)),
          ]}
          onChange={(district) => set({ district, centre: ALL })}
          className="min-w-0 flex-[0.75]"
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
          className="min-w-0 flex-[0.75]"
        />
        <SelectField
          label="Mapping"
          value={filters.mapping}
          options={mappingOptions}
          onChange={(mapping) => set({ mapping })}
          className="min-w-0 flex-[0.6]"
        />
        <SelectField
          label="Status"
          value={filters.status}
          options={[
            { value: ALL, label: 'All' },
            ...Object.entries(examStatuses).map(([value, { label }]) => ({ value, label })),
          ]}
          onChange={(status) => set({ status })}
          className="min-w-0 flex-[0.6]"
        />
        <Button type="submit">
          <Search aria-hidden className="size-4" />
          Search
        </Button>
      </FilterBar>

      <dl className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} tone="sky" value={candidates.length} label="Registered Candidates" />
        <StatCard icon={UserCheck} tone="green" value={mapped} label="Mapped to a System" />
        <StatCard icon={MapPinned} tone="amber" value={unmapped} label="Not Mapped" />
        <StatCard icon={CircleAlert} tone="rose" value={onFaultyPc} label="On a Faulty PC" />
      </dl>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Candidates are mapped to their 1st choice centre, then their 2nd and 3rd when it is full.
          Faulty computers are never used.
        </p>
        <Button variant="primary" disabled={unmapped === 0} onClick={handleAutoMap}>
          <Wand2 aria-hidden className="size-4" />
          Auto-map by Preference ({unmapped})
        </Button>
      </div>

      <DataTable
        dense
        caption="Candidates"
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.registrationNo}
        emptyMessage="No candidates match these filters."
      />

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
    </>
  );
}
