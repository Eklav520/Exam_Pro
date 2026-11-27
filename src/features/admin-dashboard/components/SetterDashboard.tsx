import { CircleCheck, FilePen, FileText, Hourglass, Undo2 } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { useCurrentUser } from '@/features/auth';
import { isOwnPaper, selectPapers } from '@/features/question-papers';
import { to } from '@/shared/config/paths';
import { formatDate } from '@/shared/lib/format';
import { StatCard } from '@/shared/ui';
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
            title: `${paper.name} of ${paper.exam} was returned for changes`,
            detail: `Remarks: ${paper.remarks}`,
            to: to.adminPaperEdit(paper.id),
            action: 'Make Changes',
          }
        : {
            id: paper.id,
            icon: FilePen,
            title: `Prepare ${paper.name} of ${paper.exam}`,
            detail: paper.dueDate
              ? `Send it for approval by ${formatDate(paper.dueDate)}.`
              : `Last updated ${paper.updatedAt}.`,
            to: to.adminPaperEdit(paper.id),
            action: 'Continue',
          },
    );

  return (
    <>
      <DashboardHeader description="Prepare the paper sets the Admin assigned to you, in each exam's pattern, then send them to the Higher Official." />
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
