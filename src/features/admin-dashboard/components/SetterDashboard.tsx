import { ArrowRight, CircleCheck, FilePen, FileText, Hourglass, Undo2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { useCurrentUser } from '@/features/auth';
import {
  getPaperTotals,
  isOwnPaper,
  PaperStatusBadge,
  selectPapers,
  type PaperSet,
} from '@/features/question-papers';
import { path, to } from '@/shared/config/paths';
import { getPatternTotals } from '@/shared/lib/examPattern';
import { formatDate } from '@/shared/lib/format';
import { buttonClass, Card, DataTable, StatCard, type Column } from '@/shared/ui';
import { DashboardHeader } from './DashboardHeader';
import { StatusDonut } from './StatusDonut';
import { TaskList, type Task } from './TaskList';

const RECENT_LIMIT = 5;

/** Questions written against what the exam's pattern asks for; null without a pattern. */
function getProgress(paper: PaperSet) {
  if (!paper.pattern?.length) return null;
  return {
    done: getPaperTotals(paper).questions,
    total: getPatternTotals(paper.pattern).questions,
    unit: 'questions',
  };
}

export function SetterDashboard() {
  const userId = useCurrentUser()?.id ?? '';
  const papers = useAppSelector(selectPapers).filter((paper) => isOwnPaper(paper, userId));
  const count = (status: string) => papers.filter((paper) => paper.status === status).length;

  const tasks: Task[] = papers
    .filter((paper) => paper.status === 'draft')
    // Returned sets first: the Higher Official is waiting on them.
    .sort((a, b) => Number(Boolean(b.remarks)) - Number(Boolean(a.remarks)))
    .map((paper) => {
      const shared = {
        id: paper.id,
        to: to.adminPaperEdit(paper.id),
        due: paper.dueDate || undefined,
        progress: getProgress(paper) ?? undefined,
      };
      return paper.remarks
        ? {
            ...shared,
            icon: Undo2,
            urgent: true,
            title: `${paper.name} of ${paper.exam} was returned for changes`,
            detail: `Remarks: ${paper.remarks}`,
            action: 'Make Changes',
          }
        : {
            ...shared,
            icon: FilePen,
            title: `Prepare ${paper.name} of ${paper.exam}`,
            detail: paper.dueDate
              ? `Send it for approval by ${formatDate(paper.dueDate)}.`
              : `Last updated ${paper.updatedAt}.`,
            action: 'Continue',
          };
    });

  const columns: Column<PaperSet>[] = [
    {
      header: 'Paper Set',
      cell: (paper) => (
        <span className="block min-w-56 whitespace-normal">
          <span className="block font-medium">{paper.name}</span>
          <span className="text-sm text-muted">{paper.exam}</span>
        </span>
      ),
    },
    {
      header: 'Progress',
      cell: (paper) => {
        const progress = getProgress(paper);
        return progress
          ? `${progress.done} of ${progress.total} questions`
          : `${getPaperTotals(paper).questions} questions`;
      },
    },
    { header: 'Due Date', cell: (paper) => (paper.dueDate ? formatDate(paper.dueDate) : '–') },
    {
      header: 'Status',
      align: 'center',
      cell: (paper) => <PaperStatusBadge status={paper.status} />,
    },
  ];

  return (
    <>
      <DashboardHeader
        description="Prepare the paper sets the Admin assigned to you, in each exam's pattern, then send them to the Higher Official."
        actions={
          <Link to={path.adminQuestionPapers} className={buttonClass('secondary')}>
            <FileText aria-hidden className="size-4" />
            View All Paper Sets
          </Link>
        }
      />
      <dl className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileText} tone="blue" value={papers.length} label="My Paper Sets" />
        <StatCard icon={FilePen} tone="amber" value={count('draft')} label="Drafts" />
        <StatCard
          icon={Hourglass}
          tone="sky"
          value={count('under_review')}
          label="Awaiting Approval"
        />
        <StatCard icon={CircleCheck} tone="green" value={count('approved')} label="Approved" />
      </dl>
      <div className="mb-5 grid gap-5 xl:grid-cols-[3fr_2fr]">
        <TaskList tasks={tasks} />
        <Card>
          <h2 className="mb-4 font-bold">Paper Set Status</h2>
          <StatusDonut
            totalLabel="Paper Sets"
            items={[
              { label: 'Draft', count: count('draft'), color: '#e0a030' },
              { label: 'Awaiting Approval', count: count('under_review'), color: '#3b8fd6' },
              { label: 'Approved', count: count('approved'), color: '#2f9e5b' },
            ]}
          />
        </Card>
      </div>
      {papers.length > 0 && (
        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold">Recent Paper Sets</h2>
            {papers.length > RECENT_LIMIT && (
              <Link
                to={path.adminQuestionPapers}
                className="flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline"
              >
                View all {papers.length} <ArrowRight aria-hidden className="size-4" />
              </Link>
            )}
          </div>
          <DataTable
            dense
            caption="Recent paper sets"
            columns={columns}
            rows={papers.slice(0, RECENT_LIMIT)}
            getRowKey={(paper) => paper.id}
            emptyMessage="No paper sets yet."
          />
        </Card>
      )}
    </>
  );
}
