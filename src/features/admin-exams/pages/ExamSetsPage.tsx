import { ArrowLeft, Copy, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  assignmentRemoved,
  createAssignedSet,
  getNextSetName,
  isSetOfExam,
  paperSetters,
  PaperStatusBadge,
  selectPapers,
  setAssigned,
  type PaperSet,
} from '@/features/question-papers';
import { path, to } from '@/shared/config/paths';
import { getPatternTotals, sectionTypes } from '@/shared/lib/examPattern';
import { formatDate } from '@/shared/lib/format';
import {
  Button,
  buttonClass,
  Card,
  ConfirmDialog,
  DataTable,
  EmptyState,
  IconButton,
  PageError,
  PageHeader,
  PageLoader,
  useToast,
  type Column,
} from '@/shared/ui';
import { useGetAdminExamQuery } from '../api/adminExamsApi';
import { AssignSetDialog, type Assignment } from '../components/AssignSetDialog';

const hasWork = (paper: PaperSet) => paper.mcqs.length + paper.tasks.length > 0;

/** The Admin hands out sets of one exam, each with the exam's pattern, to different setters. */
export function ExamSetsPage() {
  const { examId = '' } = useParams();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { currentData: exam, error, refetch } = useGetAdminExamQuery(examId);
  const papers = useAppSelector(selectPapers);
  const [dialog, setDialog] = useState<{ copyOf: string | null } | null>(null);
  const [removing, setRemoving] = useState<PaperSet | null>(null);

  if (error) return <PageError error={error} onRetry={() => void refetch()} />;
  if (!exam) return <PageLoader label="Loading exam…" />;

  const sections = exam.sections ?? [];
  const totals = getPatternTotals(sections);
  const sets = papers.filter((paper) => isSetOfExam(paper, exam));
  const busySetterIds = new Set(sets.flatMap((paper) => (paper.setter ? [paper.setter.id] : [])));

  const handleAssign = ({ name, setter, dueDate }: Assignment) => {
    dispatch(
      setAssigned(createAssignedSet({ exam: { ...exam, sections }, name, setter, dueDate })),
    );
    toast(`${name} is assigned to ${setter.name}. Not saved to a server yet.`);
    setDialog(null);
  };

  const columns: Column<PaperSet>[] = [
    { header: 'Set', cell: (paper) => <span className="font-semibold">{paper.name}</span> },
    { header: 'Paper Setter', cell: (paper) => paper.setter?.name ?? '–' },
    { header: 'Assigned On', cell: (paper) => paper.assignedOn ?? '–' },
    { header: 'Due Date', cell: (paper) => (paper.dueDate ? formatDate(paper.dueDate) : '–') },
    {
      header: 'Progress',
      cell: (paper) =>
        hasWork(paper) ? `${paper.mcqs.length + paper.tasks.length} items prepared` : 'Not started',
    },
    {
      header: 'Status',
      align: 'center',
      cell: (paper) => <PaperStatusBadge status={paper.status} />,
    },
    {
      header: 'Actions',
      align: 'center',
      cell: (paper) => (
        <span className="inline-flex gap-1">
          <IconButton
            icon={Copy}
            label={`Duplicate ${paper.name}`}
            onClick={() => setDialog({ copyOf: paper.name })}
          />
          <IconButton
            icon={Trash2}
            danger
            // Work a setter has done is never thrown away from here.
            disabled={paper.status !== 'draft' || hasWork(paper)}
            label={`Remove ${paper.name}`}
            onClick={() => setRemoving(paper)}
          />
        </span>
      ),
    },
  ];

  return (
    <>
      <Link
        to={path.adminExams}
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Back to Exam Setup
      </Link>
      <PageHeader
        title="Paper Sets"
        description={`${exam.title}. Each set uses this exam's pattern and goes to a different paper setter.`}
        actions={
          <Button disabled={sections.length === 0} onClick={() => setDialog({ copyOf: null })}>
            <Plus aria-hidden className="size-4" />
            Assign Paper Set
          </Button>
        }
      />

      <Card className="mb-5">
        <h2 className="mb-3 font-bold">
          Exam Pattern{' '}
          <span className="font-medium text-muted">
            · {totals.questions} questions · {totals.marks} marks
          </span>
        </h2>
        {sections.length === 0 ? (
          <p className="text-muted">
            This exam has no pattern yet.{' '}
            <Link to={to.adminExamEdit(exam.id)} className="font-semibold text-blue-700">
              Set its sections
            </Link>{' '}
            before assigning sets.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {sections.map((section) => (
              <li key={section.id} className="rounded-lg border border-line px-3 py-2 text-sm">
                <span className="font-semibold">
                  {section.name}
                  {section.title && ` – ${section.title}`}:
                </span>{' '}
                {section.groups
                  .map((group) => `${sectionTypes[group.type].label} × ${group.questionCount}`)
                  .join(', ')}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {sets.length === 0 ? (
        <EmptyState title="No paper sets yet">
          Assign the first set to a paper setter. Add more sets with the same pattern for other
          setters.
        </EmptyState>
      ) : (
        <DataTable
          caption="Paper sets"
          columns={columns}
          rows={sets}
          getRowKey={(paper) => paper.id}
        />
      )}

      <div className="mt-4">
        <Link to={path.adminExams} className={buttonClass('ghost')}>
          Done
        </Link>
      </div>

      {dialog && (
        <AssignSetDialog
          name={getNextSetName(sets, exam.title)}
          copyOf={dialog.copyOf}
          setters={paperSetters}
          busySetterIds={busySetterIds}
          takenNames={new Set(sets.map((paper) => paper.name))}
          onAssign={handleAssign}
          onClose={() => setDialog(null)}
        />
      )}
      <ConfirmDialog
        open={removing !== null}
        title={`Remove ${removing?.name ?? ''}?`}
        confirmLabel="Remove"
        danger
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) {
            dispatch(assignmentRemoved(removing.id));
            toast(`${removing.name} is removed.`);
          }
          setRemoving(null);
        }}
      >
        {removing?.setter?.name ?? 'The setter'} has not started it, so nothing is lost.
      </ConfirmDialog>
    </>
  );
}
