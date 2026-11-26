import { ArrowRight, CircleCheck, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/shared/ui';

export interface Task {
  id: string;
  icon: LucideIcon;
  title: string;
  detail: string;
  to: string;
  action: string;
}

/** What needs this person's attention now, each with a link to do it. */
export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <Card>
      <h2 className="mb-3 font-bold">Your Tasks</h2>
      {tasks.length === 0 ? (
        <p className="flex items-center gap-2 py-6 text-muted">
          <CircleCheck aria-hidden className="size-5 text-emerald-600" />
          Nothing needs your attention right now.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {tasks.map(({ id, icon: Icon, title, detail, to, action }) => (
            <li key={id} className="flex flex-wrap items-center gap-3 py-3">
              <Icon aria-hidden className="size-5 shrink-0 text-brand-700" strokeWidth={1.75} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted">{detail}</p>
              </div>
              <Link
                to={to}
                className="flex items-center gap-1 text-sm font-semibold whitespace-nowrap text-blue-700 hover:underline"
              >
                {action} <ArrowRight aria-hidden className="size-4" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
