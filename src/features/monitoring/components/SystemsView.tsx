import { CircleAlert, Eye, Monitor, MonitorCheck, MonitorPause, Search, X } from 'lucide-react';
import { useId, useState } from 'react';
import {
  useGetCentresQuery,
  useGetTerminalsQuery,
  type CentreDto,
  type TerminalDto,
} from '@/features/centres';
import {
  Badge,
  DataTable,
  EmptyState,
  FilterBar,
  IconButton,
  Modal,
  PageError,
  PageLoader,
  SelectField,
  StatCard,
  type Column,
} from '@/shared/ui';
import { CentreSystems } from './CentreSystems';

const ALL = 'all';
/** How often the screen asks for fresh terminal states. */
const REFRESH_MS = 30_000;
const UNKNOWN = 'Not set';

type Health = 'active' | 'attention' | 'offline';

const healths: Record<Health, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  active: { label: 'Active', tone: 'success' },
  attention: { label: 'Needs Attention', tone: 'warning' },
  offline: { label: 'Offline', tone: 'danger' },
};

interface CentreRow {
  centre: CentreDto;
  terminals: TerminalDto[];
  inUse: number;
  idle: number;
  fault: number;
  health: Health;
}

function toRow(centre: CentreDto, terminals: TerminalDto[]): CentreRow {
  const count = (...statuses: TerminalDto['status'][]) =>
    terminals.filter((terminal) => statuses.includes(terminal.status)).length;
  const fault = count('FAULT');
  // Offline when no machine is reporting in; needs attention when any has a fault.
  const health: Health =
    terminals.length === 0 || fault === terminals.length
      ? 'offline'
      : fault > 0
        ? 'attention'
        : 'active';
  return {
    centre,
    terminals,
    inUse: count('IN_EXAM', 'ONLINE'),
    idle: count('IDLE'),
    fault,
    health,
  };
}

const stateOf = (centre: CentreDto) => centre.state ?? UNKNOWN;
const districtOf = (centre: CentreDto) => centre.district ?? UNKNOWN;
const unique = (values: string[]) => [...new Set(values)].sort();
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

/** State → district → centre, with any centre's computers one click away. */
export function SystemsView() {
  const titleId = useId();
  const centres = useGetCentresQuery();
  const terminals = useGetTerminalsQuery(undefined, { pollingInterval: REFRESH_MS });
  const [state, setState] = useState(ALL);
  const [district, setDistrict] = useState(ALL);
  const [health, setHealth] = useState(ALL);
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const error = centres.error ?? terminals.error;
  if (error) {
    return (
      <PageError
        error={error}
        onRetry={() => {
          void centres.refetch();
          void terminals.refetch();
        }}
      />
    );
  }
  if (!centres.data || !terminals.data) return <PageLoader label="Loading centre systems…" />;

  const allCentres = centres.data.centres;
  if (allCentres.length === 0) {
    return (
      <EmptyState title="No centres yet">
        Add centres and register their computers in Centres &amp; Systems.
      </EmptyState>
    );
  }

  const allTerminals = terminals.data.terminals;
  const rows = allCentres
    .map((centre) =>
      toRow(
        centre,
        allTerminals.filter((terminal) => terminal.centreId === centre._id),
      ),
    )
    .sort(
      (a, b) =>
        stateOf(a.centre).localeCompare(stateOf(b.centre)) ||
        districtOf(a.centre).localeCompare(districtOf(b.centre)) ||
        a.centre.name.localeCompare(b.centre.name),
    );

  const states = unique(allCentres.map(stateOf));
  const districts = unique(
    allCentres.filter((centre) => state === ALL || stateOf(centre) === state).map(districtOf),
  );
  const term = search.trim().toLowerCase();
  const shown = rows.filter(
    ({ centre, health: rowHealth }) =>
      (state === ALL || stateOf(centre) === state) &&
      (district === ALL || districtOf(centre) === district) &&
      (health === ALL || rowHealth === health) &&
      `${centre.name} ${centre.code} ${centre.city}`.toLowerCase().includes(term),
  );
  const totals = shown.reduce(
    (sum, row) => ({
      computers: sum.computers + row.terminals.length,
      inUse: sum.inUse + row.inUse,
      idle: sum.idle + row.idle,
      fault: sum.fault + row.fault,
    }),
    { computers: 0, inUse: 0, idle: 0, fault: 0 },
  );
  const scope = [state === ALL ? 'All states' : state, district === ALL ? null : district]
    .filter(Boolean)
    .join(' › ');
  const open = rows.find((row) => row.centre._id === openId);
  const { fulfilledTimeStamp } = terminals;
  const updatedAt = fulfilledTimeStamp
    ? new Date(fulfilledTimeStamp).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '–';

  const columns: Column<CentreRow>[] = [
    {
      header: 'Centre',
      cell: ({ centre }) => (
        <span>
          <span className="block font-semibold">{centre.name}</span>
          <span className="text-xs text-muted">{centre.code}</span>
        </span>
      ),
    },
    { header: 'City', cell: ({ centre }) => centre.city },
    { header: 'District', cell: ({ centre }) => districtOf(centre) },
    { header: 'State', cell: ({ centre }) => stateOf(centre) },
    { header: 'Computers', align: 'center', cell: (row) => row.terminals.length },
    { header: 'Online / In Exam', align: 'center', cell: (row) => row.inUse },
    { header: 'Idle', align: 'center', cell: (row) => row.idle },
    {
      header: 'Fault',
      align: 'center',
      cell: (row) => (
        <span className={row.fault > 0 ? 'font-semibold text-danger' : undefined}>{row.fault}</span>
      ),
    },
    {
      header: 'Status',
      align: 'center',
      cell: (row) => <Badge tone={healths[row.health].tone}>{healths[row.health].label}</Badge>,
    },
    {
      header: 'Systems',
      align: 'center',
      cell: ({ centre }) => (
        <IconButton
          icon={Eye}
          label={`View systems of ${centre.name}`}
          onClick={() => setOpenId(centre._id)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <FilterBar label="Filter centres">
        <SelectField
          label="State"
          value={state}
          options={[{ value: ALL, label: 'All States' }, ...states]}
          onChange={(value) => {
            setState(value);
            setDistrict(ALL);
          }}
          className="flex-1 sm:min-w-44"
        />
        <SelectField
          label="District"
          value={district}
          options={[{ value: ALL, label: 'All Districts' }, ...districts]}
          onChange={setDistrict}
          className="flex-1 sm:min-w-44"
        />
        <SelectField
          label="Centre Status"
          value={health}
          options={[
            { value: ALL, label: 'All' },
            ...Object.entries(healths).map(([value, { label }]) => ({ value, label })),
          ]}
          onChange={setHealth}
          className="flex-1 sm:min-w-40"
        />
        <div className="relative min-w-48 flex-1">
          <input
            type="search"
            aria-label="Search centres"
            placeholder="Search centre, code or city..."
            className="control pr-9"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
          />
        </div>
      </FilterBar>

      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Monitor}
          tone="blue"
          value={totals.computers}
          label="Registered Computers"
        />
        <StatCard icon={MonitorCheck} tone="green" value={totals.inUse} label="Online / In Exam" />
        <StatCard icon={MonitorPause} tone="amber" value={totals.idle} label="Idle" />
        <StatCard icon={CircleAlert} tone="red" value={totals.fault} label="Fault" />
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="font-semibold">
          {scope} · {plural(shown.length, 'centre')} in{' '}
          {plural(unique(shown.map(({ centre }) => districtOf(centre))).length, 'district')}
        </p>
        <p className="text-muted" role="status">
          Updated {updatedAt} · refreshes every 30 seconds
        </p>
      </div>

      <DataTable
        dense
        caption="Centres"
        columns={columns}
        rows={shown}
        getRowKey={({ centre }) => centre._id}
        emptyMessage="No centres match these filters."
      />

      {open && (
        // About three quarters of the screen, with the page blurred behind it.
        <Modal
          open
          titleId={titleId}
          onClose={() => setOpenId(null)}
          className="max-h-[85dvh] w-[95vw]! max-w-none! overflow-x-hidden overflow-y-auto backdrop:backdrop-blur-sm lg:w-[75vw]!"
        >
          <div className="mb-2 flex justify-end">
            <IconButton icon={X} label="Close" onClick={() => setOpenId(null)} />
          </div>
          <CentreSystems centre={open.centre} terminals={open.terminals} headingId={titleId} />
        </Modal>
      )}
    </div>
  );
}
