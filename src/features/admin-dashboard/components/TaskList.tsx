import clsx from 'clsx';
import { ArrowRight, CalendarClock, CircleCheck, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, buttonClass, Card, ProgressBar } from '@/shared/ui';
import { describeDue } from '../model/due';

export interface Task {
  id: string;
  icon: LucideIcon;
  title: string;
  detail: string;
  to: string;
  action: string;
  /** Highlights work someone else is waiting on, such as a returned set. */
  urgent?: boolean;
  /** yyyy-mm-dd deadline, shown as days left. */
  due?: string;
  progress?: { done: number; total: number; unit: string };
}

/** What needs this person's attention now, each with a link to do it. */
export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <Card className="flex flex-col">
      <div className="mb-1 flex items-center gap-2">
        <h2 className="font-bold">Your Tasks</h2>
        {tasks.length > 0 && (
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-800 tabular-nums">
            {tasks.length}
            <span className="sr-only"> {tasks.length === 1 ? 'task' : 'tasks'}</span>
          </span>
        )}
      </div>
      {tasks.length === 0 ? (
        <p className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center text-muted">
          <CircleCheck aria-hidden className="size-8 text-emerald-600" strokeWidth={1.75} />
          Nothing needs your attention right now.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function TaskItem({ task }: { task: Task }) {
  const { icon: Icon, title, detail, to, action, urgent, due, progress } = task;
  const dueState = due ? describeDue(due) : null;
  const percent =
    progress && progress.total > 0
      ? Math.min(100, Math.round((progress.done / progress.total) * 100))
      : 0;

  return (
    <li className="flex flex-wrap items-start gap-x-4 gap-y-3 py-4 last:pb-0">
      <span
        aria-hidden
        className={clsx(
          'flex size-10 shrink-0 items-center justify-center rounded-lg',
          urgent ? 'bg-warning-soft text-warning' : 'bg-brand-50 text-brand-700',
        )}
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1 basis-60">
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-sm text-muted">{detail}</p>
        {(dueState ?? progress) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            {dueState && (
              <Badge tone={dueState.tone}>
                <CalendarClock aria-hidden className="mr-1 size-3.5" />
                {dueState.label}
              </Badge>
            )}
            {progress && (
              <div className="flex min-w-56 flex-1 items-center gap-3 sm:max-w-80">
                <span className="whitespace-nowrap text-muted tabular-nums">
                  {progress.done} of {progress.total} {progress.unit}
                </span>
                <div className="flex-1">
                  <ProgressBar label={`${title} progress`} percent={percent} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Link
        to={to}
        className={clsx(buttonClass(urgent ? 'primary' : 'secondary', 'sm'), 'self-center')}
      >
        {action} <ArrowRight aria-hidden className="size-4" />
      </Link>
    </li>
  );
}
