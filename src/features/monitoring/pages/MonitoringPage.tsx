import { CircleCheck, CircleX, Eye, FileText, Search, Users } from 'lucide-react';
import { useId, useState } from 'react';
import { SAMPLE_EXAM, sampleExams } from '@/features/question-papers';
import {
  Badge,
  Button,
  DataTable,
  FilterBar,
  IconButton,
  PageHeader,
  SelectField,
  StatCard,
  Tabs,
  usePreviewAction,
  type Column,
} from '@/shared/ui';
import {
  attendance,
  candidates,
  centres,
  SAMPLE_EXAM_DATE,
  type CandidateStatus,
  type MonitoredCandidate,
} from '../data/sample';
import { SystemsView } from '../components/SystemsView';

const tabs = [
  { id: 'candidates', label: 'Candidates' },
  { id: 'systems', label: 'Centre Systems' },
] as const;

const ALL = 'all';

const statuses: Record<CandidateStatus, { label: string; tone: 'success' | 'info' | 'danger' }> = {
  submitted: { label: 'Submitted', tone: 'success' },
  attended: { label: 'Attended', tone: 'info' },
  not_attended: { label: 'Not Attended', tone: 'danger' },
};

const initialFilters = { exam: SAMPLE_EXAM, date: SAMPLE_EXAM_DATE, centre: ALL, status: ALL };

const percentOf = (part: number, whole: number) => `${((part / whole) * 100).toFixed(1)}%`;

export function MonitoringPage() {
  const preview = usePreviewAction();
  const dateId = useId();
  const [filters, setFilters] = useState(initialFilters);
  const [applied, setApplied] = useState(initialFilters);
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('candidates');
  const set = (change: Partial<typeof initialFilters>) => setFilters({ ...filters, ...change });

  const rows = candidates.filter(
    (candidate) =>
      applied.exam === SAMPLE_EXAM &&
      applied.date === SAMPLE_EXAM_DATE &&
      (applied.centre === ALL || candidate.centre === applied.centre) &&
      (applied.status === ALL || candidate.status === applied.status),
  );

  const { allocated, attended, submitted } = attendance;
  const absent = allocated - attended;

  const columns: Column<MonitoredCandidate>[] = [
    { header: '#', cell: (_candidate, index) => index + 1 },
    { header: 'Registration No.', cell: (candidate) => candidate.registrationNo },
    { header: 'Candidate Name', cell: (candidate) => candidate.name },
    { header: 'Centre', cell: (candidate) => candidate.centre },
    { header: 'Paper Set', cell: (candidate) => candidate.paperSet },
    {
      header: 'Exam Status',
      align: 'center',
      cell: ({ status }) => <Badge tone={statuses[status].tone}>{statuses[status].label}</Badge>,
    },
    { header: 'Submission Time', cell: (candidate) => candidate.submittedAt ?? '–' },
    {
      header: 'Actions',
      align: 'center',
      cell: (candidate) => (
        <IconButton
          icon={Eye}
          label={`View ${candidate.name}`}
          onClick={() => preview(`View ${candidate.name}`)}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Examination Monitoring"
        description="Track candidate attendance and submissions, and the computers at every centre, in real time."
      />
      <Tabs label="Monitoring views" tabs={tabs} active={tab} onChange={setTab}>
        {tab === 'systems' ? (
          <SystemsView />
        ) : (
          <>
            <FilterBar label="Filter candidates" onSubmit={() => setApplied(filters)}>
              <SelectField
                label="Examination"
                value={filters.exam}
                options={sampleExams}
                onChange={(exam) => set({ exam })}
                className="flex-1 sm:min-w-56"
              />
              <div className="min-w-40 flex-1">
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
                label="Centre"
                value={filters.centre}
                options={[{ value: ALL, label: 'All Centres' }, ...centres]}
                onChange={(centre) => set({ centre })}
                className="flex-1"
              />
              <SelectField
                label="Status"
                value={filters.status}
                options={[
                  { value: ALL, label: 'All' },
                  ...Object.entries(statuses).map(([value, { label }]) => ({ value, label })),
                ]}
                onChange={(status) => set({ status })}
                className="flex-1"
              />
              <Button type="submit">
                <Search aria-hidden className="size-4" />
                Search
              </Button>
            </FilterBar>
            <dl className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={Users} tone="sky" value={allocated} label="Allocated Candidates" />
              <StatCard
                icon={CircleCheck}
                tone="green"
                value={attended}
                label={`Attended (${percentOf(attended, allocated)})`}
              />
              <StatCard
                icon={FileText}
                tone="blue"
                value={submitted}
                label={`Submitted (${percentOf(submitted, attended)})`}
              />
              <StatCard
                icon={CircleX}
                tone="rose"
                value={absent}
                label={`Not Attended (${percentOf(absent, allocated)})`}
              />
            </dl>
            <DataTable
              caption="Candidates"
              columns={columns}
              rows={rows}
              getRowKey={(candidate) => candidate.registrationNo}
              emptyMessage="No candidates match these filters."
            />
          </>
        )}
      </Tabs>
    </>
  );
}
