import { CalendarCheck, FilePen, Pencil, Plus, Search, Trash2, Layers } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '@/shared/api/getErrorMessage';
import { path, to } from '@/shared/config/paths';
import { formatDuration } from '@/shared/lib/format';
import type { ExamSummary } from '@/shared/types';
import {
  Alert,
  Badge,
  buttonClass,
  ConfirmDialog,
  DataTable,
  EmptyState,
  FilterBar,
  IconButton,
  PageError,
  PageHeader,
  PageLoader,
  SelectField,
  StatCard,
  type Column,
} from '@/shared/ui';
import { useDeleteExamMutation, useGetAdminExamsQuery } from '../api/adminExamsApi';

const ALL = 'all';

export function AdminExamListPage() {
  const navigate = useNavigate();
  const { data: exams, error, refetch } = useGetAdminExamsQuery();
  const [deleteExam, deletion] = useDeleteExamMutation();
  const [target, setTarget] = useState<ExamSummary | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(ALL);

  const handleDelete = async () => {
    if (!target) return;
    await deleteExam(target.id);
    setTarget(null);
  };

  const term = search.trim().toLowerCase();
  const rows = (exams ?? []).filter(
    (exam) =>
      (status === ALL || exam.status === status) &&
      `${exam.title} ${exam.subject}`.toLowerCase().includes(term),
  );
  const published = exams?.filter((exam) => exam.status === 'published').length ?? 0;

  const columns: Column<ExamSummary>[] = [
    {
      header: 'Exam',
      cell: (exam) => (
        <span>
          <span className="block font-semibold">{exam.title}</span>
          <span className="text-sm text-muted">{exam.subject}</span>
        </span>
      ),
    },
    { header: 'MCQs', align: 'center', cell: (exam) => exam.questionCount },
    { header: 'Practical Tasks', align: 'center', cell: (exam) => exam.taskCount },
    { header: 'Total Marks', align: 'center', cell: (exam) => exam.totalMarks },
    { header: 'Duration', cell: (exam) => formatDuration(exam.durationMinutes) },
    { header: 'Pass Mark', align: 'center', cell: (exam) => `${exam.passPercentage}%` },
    {
      header: 'Status',
      align: 'center',
      cell: (exam) => (
        <Badge tone={exam.status === 'published' ? 'success' : 'neutral'}>
          {exam.status === 'published' ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      align: 'center',
      cell: (exam) => (
        <span className="inline-flex gap-1">
          <IconButton
            icon={Pencil}
            label={`Edit ${exam.title}`}
            onClick={() => void navigate(to.adminExamEdit(exam.id))}
          />
          <IconButton
            icon={Trash2}
            danger
            label={`Delete ${exam.title}`}
            onClick={() => setTarget(exam)}
          />
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Examinations"
        description="Create exams, add their questions and practical tasks, and publish them."
        actions={
          <Link to={path.adminExamNew} className={buttonClass()}>
            <Plus aria-hidden className="size-4" />
            Create Exam
          </Link>
        }
      />
      {error && <PageError error={error} onRetry={() => void refetch()} />}
      {!exams && !error && <PageLoader label="Loading exams…" />}
      {exams && (
        <>
          <dl className="mb-5 grid gap-4 sm:grid-cols-3">
            <StatCard icon={Layers} tone="blue" value={exams.length} label="Total Exams" />
            <StatCard icon={CalendarCheck} tone="green" value={published} label="Published" />
            <StatCard icon={FilePen} tone="amber" value={exams.length - published} label="Drafts" />
          </dl>
          {deletion.error && (
            <div className="mb-4">
              <Alert>{getErrorMessage(deletion.error)}</Alert>
            </div>
          )}
          {exams.length === 0 ? (
            <EmptyState title="No exams yet">Create your first exam to get started.</EmptyState>
          ) : (
            <>
              <FilterBar label="Filter exams">
                <div className="relative min-w-56 flex-1">
                  <Search
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                  />
                  <input
                    type="search"
                    aria-label="Search exams"
                    placeholder="Search by title or subject..."
                    className="control pl-9"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <SelectField
                  label="Status"
                  value={status}
                  onChange={setStatus}
                  options={[
                    { value: ALL, label: 'All' },
                    { value: 'published', label: 'Published' },
                    { value: 'draft', label: 'Draft' },
                  ]}
                />
              </FilterBar>
              <DataTable
                caption="Exams"
                columns={columns}
                rows={rows}
                getRowKey={(exam) => exam.id}
                emptyMessage="No exams match these filters."
              />
            </>
          )}
        </>
      )}
      <ConfirmDialog
        open={target !== null}
        title={`Delete “${target?.title ?? ''}”?`}
        confirmLabel="Delete exam"
        danger
        isLoading={deletion.isLoading}
        onCancel={() => setTarget(null)}
        onConfirm={() => void handleDelete()}
      >
        Students can no longer start it. Results already submitted are kept.
      </ConfirmDialog>
    </>
  );
}
