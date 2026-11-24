import { Copy, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  Badge,
  Button,
  DataTable,
  FilterBar,
  IconButton,
  PageHeader,
  SelectField,
  usePreviewAction,
  type Column,
} from '@/shared/ui';
import { PaperStatusBadge } from '../components/PaperStatusBadge';
import { paperSets, paperTypes, SAMPLE_EXAM, sampleExams, type PaperSet } from '../data/sample';

const ALL = 'all';

const statusOptions = [
  { value: ALL, label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
];

export function QuestionPapersPage() {
  const preview = usePreviewAction();
  const [exam, setExam] = useState(SAMPLE_EXAM);
  const [type, setType] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [search, setSearch] = useState('');

  const term = search.trim().toLowerCase();
  const rows = paperSets.filter(
    (paper) =>
      paper.exam === exam &&
      (type === ALL || paper.type === type) &&
      (status === ALL || paper.status === status) &&
      paper.title.toLowerCase().includes(term),
  );

  const columns: Column<PaperSet>[] = [
    { header: 'Set', cell: (paper) => <Badge tone="info">{paper.name}</Badge> },
    { header: 'Paper Title', cell: (paper) => <span className="font-medium">{paper.title}</span> },
    { header: 'Total Questions', align: 'center', cell: (paper) => paper.totalQuestions },
    { header: 'Total Marks', align: 'center', cell: (paper) => paper.totalMarks },
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
            label={`Edit ${paper.name}`}
            onClick={() => preview(`Edit ${paper.name}`)}
          />
          <IconButton
            icon={Copy}
            label={`Duplicate ${paper.name}`}
            onClick={() => preview(`Duplicate ${paper.name}`)}
          />
          <IconButton
            icon={Trash2}
            danger
            label={`Delete ${paper.name}`}
            onClick={() => preview(`Delete ${paper.name}`)}
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
          <Button onClick={() => preview('Create Paper Set')}>
            <Plus aria-hidden className="size-4" />
            Create Paper Set
          </Button>
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
    </>
  );
}
