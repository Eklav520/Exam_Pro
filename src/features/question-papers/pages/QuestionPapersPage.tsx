import { Pencil, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { useCurrentUser } from '@/features/auth';
import { to } from '@/shared/config/paths';
import { getPatternTotals } from '@/shared/lib/examPattern';
import { formatDate } from '@/shared/lib/format';
import {
  Badge,
  DataTable,
  EmptyState,
  FilterBar,
  IconButton,
  PageHeader,
  ProgressBar,
  SelectField,
  type Column,
} from '@/shared/ui';
import { PaperStatusBadge } from '../components/PaperStatusBadge';
import {
  getPaperTotals,
  getPaperType,
  isOwnPaper,
  paperTypes,
  type PaperSet,
} from '../model/paper';
import { selectPapers } from '../model/papersSlice';

const ALL = 'all';

const statusOptions = [
  { value: ALL, label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
];

/** The sets the Admin assigned to the signed-in setter. Setters cannot create their own. */
export function QuestionPapersPage() {
  const navigate = useNavigate();
  const userId = useCurrentUser()?.id ?? '';
  const papers = useAppSelector(selectPapers).filter((paper) => isOwnPaper(paper, userId));
  const [exam, setExam] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [search, setSearch] = useState('');

  const examOptions = [
    { value: ALL, label: 'All Examinations' },
    ...new Set(papers.map((paper) => paper.exam)),
  ];
  const term = search.trim().toLowerCase();
  const rows = papers.filter(
    (paper) =>
      (exam === ALL || paper.exam === exam) &&
      (type === ALL || getPaperType(paper) === type) &&
      (status === ALL || paper.status === status) &&
      `${paper.name} ${paper.title}`.toLowerCase().includes(term),
  );

  const columns: Column<PaperSet>[] = [
    { header: 'Set', cell: (paper) => <Badge tone="info">{paper.name}</Badge> },
    {
      header: 'Paper Title',
      cell: (paper) => (
        <span className="block max-w-sm min-w-56 whitespace-normal">
          <span className="block font-medium">{paper.title}</span>
          <span className="text-sm text-muted">{paper.exam}</span>
        </span>
      ),
    },
    { header: 'Progress', cell: (paper) => <Progress paper={paper} /> },
    { header: 'Due Date', cell: (paper) => (paper.dueDate ? formatDate(paper.dueDate) : '–') },
    {
      header: 'Status',
      align: 'center',
      cell: (paper) => <PaperStatusBadge status={paper.status} />,
    },
    { header: 'Last Updated', cell: (paper) => paper.updatedAt },
    {
      header: 'Action',
      align: 'center',
      cell: (paper) => (
        <IconButton
          icon={Pencil}
          // Reviewed content must not change behind the reviewer's back.
          disabled={paper.status !== 'draft'}
          label={`Edit ${paper.title}`}
          onClick={() => void navigate(to.adminPaperEdit(paper.id))}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="My Paper Sets"
        description="The sets the Admin assigned to you. Prepare each in its exam's pattern and send it to the Higher Official for approval."
      />
      {papers.length === 0 ? (
        <EmptyState title="No paper sets are assigned to you yet">
          The Admin assigns sets from Exam Setup. They appear here when assigned.
        </EmptyState>
      ) : (
        <>
          <FilterBar label="Filter paper sets">
            <SelectField
              label="Examination"
              value={exam}
              options={examOptions}
              onChange={setExam}
              className="flex-1 sm:min-w-56"
            />
            <SelectField
              label="Paper Type"
              value={type}
              options={[{ value: ALL, label: 'All Types' }, ...paperTypes]}
              onChange={setType}
              className="flex-1"
            />
            <SelectField
              label="Status"
              value={status}
              options={statusOptions}
              onChange={setStatus}
              className="flex-1"
            />
            <div className="relative min-w-48 flex-1">
              <input
                type="search"
                aria-label="Search paper set"
                placeholder="Search paper set..."
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
          <DataTable
            dense
            caption="Paper sets"
            columns={columns}
            rows={rows}
            getRowKey={(paper) => paper.id}
            emptyMessage="No paper sets match these filters."
          />
        </>
      )}
    </>
  );
}

function Progress({ paper }: { paper: PaperSet }) {
  const totals = getPaperTotals(paper);
  if (!paper.pattern?.length) return `${totals.questions} questions`;
  const required = getPatternTotals(paper.pattern).questions;
  const percent = required > 0 ? Math.round((totals.questions / required) * 100) : 0;
  return (
    <div className="w-40">
      <p className="mb-1 text-sm">
        {totals.questions} of {required} questions
      </p>
      <ProgressBar label={`${paper.name} progress`} percent={percent} />
    </div>
  );
}
