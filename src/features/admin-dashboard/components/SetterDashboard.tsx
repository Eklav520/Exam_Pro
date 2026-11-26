import { CircleCheck, FilePen, FileText, Hourglass, Plus, Undo2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { useCurrentUser } from '@/features/auth';
import { isOwnPaper, selectPapers } from '@/features/question-papers';
import { path, to } from '@/shared/config/paths';
import { buttonClass, StatCard } from '@/shared/ui';
import { DashboardHeader } from './DashboardHeader';
import { TaskList, type Task } from './TaskList';

export function SetterDashboard() {
  const userId = useCurrentUser()?.id ?? '';
  const papers = useAppSelector(selectPapers).filter((paper) => isOwnPaper(paper, userId));
  const count = (status: string) => papers.filter((paper) => paper.status === status).length;

  const tasks: Task[] = papers
    .filter((paper) => paper.status === 'draft')
    // Returned sets first: the Higher Official is waiting on them.
    .sort((a, b) => Number(Boolean(b.remarks)) - Number(Boolean(a.remarks)))
    .map((paper) =>
      paper.remarks
        ? {
            id: paper.id,
            icon: Undo2,
            title: `${paper.name} was returned for changes`,
            detail: `${paper.exam}. Remarks: ${paper.remarks}`,
            to: to.adminPaperEdit(paper.id),
            action: 'Make Changes',
          }
        : {
            id: paper.id,
            icon: FilePen,
            title: `Finish ${paper.name} and send it for approval`,
            detail: `${paper.exam}. Last updated ${paper.updatedAt}.`,
            to: to.adminPaperEdit(paper.id),
            action: 'Continue',
          },
    );

  return (
    <>
      <DashboardHeader
        description="Prepare paper sets in the pattern the Admin set for each examination, then send them to the Higher Official."
        actions={
          <Link to={path.adminPaperNew} className={buttonClass()}>
            <Plus aria-hidden className="size-4" />
            Create Paper Set
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
      <TaskList tasks={tasks} />
    </>
  );
}
