import { CircleCheck, ClipboardCheck, Eye, FileCheck2, Hourglass, Lock } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { candidateResults, resultStats } from '@/features/evaluation';
import { SAMPLE_EXAM, selectPapers } from '@/features/question-papers';
import { path } from '@/shared/config/paths';
import { StatCard } from '@/shared/ui';
import { DashboardHeader } from './DashboardHeader';
import { TaskList, type Task } from './TaskList';

export function OfficialDashboard() {
  const papers = useAppSelector(selectPapers);
  const waiting = papers.filter((paper) => paper.status === 'under_review');
  const approved = papers.filter((paper) => paper.status === 'approved').length;

  const tasks: Task[] = [
    ...waiting.map((paper) => ({
      id: paper.id,
      icon: Lock,
      title: `Review sealed ${paper.name} – ${paper.exam}`,
      detail: `Prepared by ${paper.setter?.name ?? 'a paper setter'}, submitted on ${paper.submittedOn ?? '–'}. Approve it for the exam or return it.`,
      to: path.adminApprovals,
      action: 'Review Set',
    })),
    {
      id: 'results',
      icon: FileCheck2,
      title: `Review and release results – ${SAMPLE_EXAM}`,
      detail: `Evaluators sent marks for ${candidateResults.length} candidates; ${resultStats.underReview} need your review.`,
      to: path.adminFinalApproval,
      action: 'Review Results',
    },
  ];

  return (
    <>
      <DashboardHeader description="Choose which sealed paper set goes to the examination, then review the evaluated marks and release the results." />
      <dl className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ClipboardCheck}
          tone="amber"
          value={waiting.length}
          label="Sets Awaiting Approval"
        />
        <StatCard icon={CircleCheck} tone="green" value={approved} label="Approved Sets" />
        <StatCard
          icon={Hourglass}
          tone="blue"
          value={resultStats.evaluated}
          label="Evaluated Answer Papers"
        />
        <StatCard
          icon={Eye}
          tone="rose"
          value={resultStats.underReview}
          label="Results to Review"
        />
      </dl>
      <TaskList tasks={tasks} />
    </>
  );
}
