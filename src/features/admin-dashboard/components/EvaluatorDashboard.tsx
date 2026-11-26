import { CircleCheck, ClipboardList, Hourglass, PencilLine, Send } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { countScripts, selectAssignedScripts } from '@/features/evaluation';
import { path } from '@/shared/config/paths';
import { Card, ProgressBar, StatCard } from '@/shared/ui';
import { DashboardHeader } from './DashboardHeader';
import { TaskList, type Task } from './TaskList';

const papers = (count: number) => `${count} answer ${count === 1 ? 'paper' : 'papers'}`;

export function EvaluatorDashboard() {
  const counts = countScripts(useAppSelector(selectAssignedScripts));
  const done = counts.assigned - counts.pending;
  const percent = counts.assigned === 0 ? 0 : Math.round((done / counts.assigned) * 100);

  const tasks: Task[] = [];
  if (counts.pending > 0) {
    tasks.push({
      id: 'evaluate',
      icon: PencilLine,
      title: `Evaluate ${papers(counts.pending)}`,
      detail: 'Award marks for each practical task, with remarks.',
      to: path.adminAssignedPapers,
      action: 'Start Evaluating',
    });
  }
  if (counts.evaluated > 0) {
    tasks.push({
      id: 'send',
      icon: Send,
      title: `Send ${papers(counts.evaluated)} to the Higher Official`,
      detail: 'Marks cannot be changed after sending.',
      to: path.adminAssignedPapers,
      action: 'Review & Send',
    });
  }

  return (
    <>
      <DashboardHeader description="Evaluate the answer papers the Admin assigned to you and send the marks to the Higher Official." />
      <dl className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ClipboardList} tone="blue" value={counts.assigned} label="Assigned to Me" />
        <StatCard icon={Hourglass} tone="amber" value={counts.pending} label="Pending" />
        <StatCard icon={CircleCheck} tone="sky" value={counts.evaluated} label="Evaluated" />
        <StatCard icon={Send} tone="green" value={counts.sent} label="Sent to Higher Official" />
      </dl>
      <Card className="mb-6">
        <h2 className="mb-3 font-bold">My Progress</h2>
        <ProgressBar label="Answer papers evaluated" percent={percent} />
        <p className="mt-2 text-sm text-muted">
          {done} of {papers(counts.assigned)} evaluated.
        </p>
      </Card>
      <TaskList tasks={tasks} />
    </>
  );
}
