import { Copy, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { path, to } from '@/shared/config/paths';
import {
  Badge,
  buttonClass,
  ConfirmDialog,
  DataTable,
  FilterBar,
  IconButton,
  PageHeader,
  SelectField,
  useToast,
  type Column,
} from '@/shared/ui';
import { PaperStatusBadge } from '../components/PaperStatusBadge';
import { SAMPLE_EXAM, sampleExams } from '../data/sample';
import { getPaperTotals, getPaperType, paperTypes, type PaperSet } from '../model/paper';
import { paperDeleted, paperDuplicated, selectPapers } from '../model/papersSlice';

const ALL = 'all';

const statusOptions = [
  { value: ALL, label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
];

export function QuestionPapersPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const papers = useAppSelector(selectPapers);
  const [exam, setExam] = useState(SAMPLE_EXAM);
  const [type, setType] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<PaperSet | null>(null);

  const term = search.trim().toLowerCase();
  const rows = papers.filter(
    (paper) =>
      paper.exam === exam &&
      (type === ALL || getPaperType(paper) === type) &&
      (status === ALL || paper.status === status) &&
      `${paper.name} ${paper.title}`.toLowerCase().includes(term),
  );

  const columns: Column<PaperSet>[] = [
    { header: 'Set', cell: (paper) => <Badge tone="info">{paper.name}</Badge> },
    { header: 'Paper Title', cell: (paper) => <span className="font-medium">{paper.title}</span> },
    {
      header: 'Total Questions',
      align: 'center',
      cell: (paper) => getPaperTotals(paper).questions,
    },
    { header: 'Total Marks', align: 'center', cell: (paper) => getPaperTotals(paper).marks },
    {
      header: 'Status',
      align: 'center',
      cell: (paper) => <PaperStatusBadge status={paper.status} />,
    },
    { header: 'Last Updated', cell: (paper) => paper.updatedAt },
    {
      header: 'Actions',
      align: 'center',
      cell: (paper) => (
        <span className="inline-flex gap-1">
          <IconButton
            icon={Pencil}
            // Reviewed content must not change behind the reviewer's back.
            disabled={paper.status !== 'draft'}
            label={`Edit ${paper.name}`}
            onClick={() => void navigate(to.adminPaperEdit(paper.id))}
          />
          <IconButton
            icon={Copy}
            label={`Duplicate ${paper.name}`}
            onClick={() => {
              dispatch(paperDuplicated(paper.id));
              toast(`${paper.name} is copied to a new draft.`);
            }}
          />
          <IconButton
            icon={Trash2}
            danger
            disabled={paper.status !== 'draft'}
            label={`Delete ${paper.name}`}
            onClick={() => setDeleting(paper)}
          />
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Question Papers"
        description="Create, manage and maintain multiple paper sets for each examination."
        actions={
          <Link to={path.adminPaperNew} className={buttonClass()}>
            <Plus aria-hidden className="size-4" />
            Create Paper Set
          </Link>
        }
      />
      <FilterBar label="Filter paper sets">
        <SelectField
          label="Examination"
          value={exam}
          options={sampleExams}
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
        caption="Paper sets"
        columns={columns}
        rows={rows}
        getRowKey={(paper) => paper.id}
        emptyMessage="No paper sets match these filters."
      />
      <ConfirmDialog
        open={deleting !== null}
        title={`Delete ${deleting?.name ?? ''}?`}
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            dispatch(paperDeleted(deleting.id));
            toast(`${deleting.name} is deleted.`);
          }
          setDeleting(null);
        }}
      >
        {deleting?.title} and its questions will be removed.
      </ConfirmDialog>
    </>
  );
}
