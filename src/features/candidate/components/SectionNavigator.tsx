import clsx from 'clsx';
import { ChevronDown, ChevronRight, ClipboardCheck, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { to } from '@/shared/config/paths';
import { ProgressBar } from '@/shared/ui';
import { sectionA, sectionB, taskIds, tasks, type TaskId } from '../data/sample';
import { selectCandidate, selectCompletion, selectSectionAStatus } from '../model/candidateSlice';
import { StatusIcon } from './StatusIcon';

interface SectionNavigatorProps {
  currentTask?: TaskId | undefined;
  onOpenSectionA: () => void;
  onNavigate?: () => void;
}

export function SectionNavigator({
  currentTask,
  onOpenSectionA,
  onNavigate,
}: SectionNavigatorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const statusA = useAppSelector(selectSectionAStatus);
  const { tasks: taskStatus } = useAppSelector(selectCandidate);
  const completion = useAppSelector(selectCompletion);

  return (
    <div className="space-y-3">
      <nav aria-label="Section navigator">
        <h2 className="mb-2 rounded-xl bg-navy-800 px-5 py-2.5 font-bold text-white">
          Section Navigator
        </h2>
        <button
          type="button"
          onClick={onOpenSectionA}
          className="flex w-full items-center gap-3 rounded-t-xl border border-line px-4 py-2 text-left hover:bg-canvas"
        >
          <ClipboardCheck aria-hidden className="size-6 text-emerald-700" />
          <span className="flex-1">
            <span className="block font-bold">{sectionA.title}</span>
            <span className="block text-sm text-muted">
              {sectionA.questionCount} Q | {sectionA.marks} Marks
            </span>
          </span>
          <StatusIcon status={statusA} />
        </button>
        <div className="rounded-b-xl border border-t-0 border-line p-1.5">
          <button
            type="button"
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-1 text-left hover:bg-canvas"
          >
            <ClipboardList aria-hidden className="size-6 text-info" />
            <span className="flex-1">
              <span className="block font-bold">{sectionB.title}</span>
              <span className="block text-sm text-muted">
                {taskIds.length} Tasks | {sectionB.marks} Marks
              </span>
            </span>
            <ChevronDown
              aria-hidden
              className={clsx('size-5 transition-transform', isExpanded && 'rotate-180')}
            />
          </button>
          {isExpanded && (
            <ul className="mt-1">
              {taskIds.map((id) => (
                <li key={id}>
                  <Link
                    to={to.candidateTask(id)}
                    onClick={onNavigate}
                    aria-current={id === currentTask ? 'page' : undefined}
                    className={clsx(
                      'flex items-center gap-2 rounded-lg px-2 py-2 text-sm',
                      id === currentTask ? 'bg-[#c9e2fe] font-bold' : 'hover:bg-canvas',
                    )}
                  >
                    <ChevronRight aria-hidden className="size-4 shrink-0" />
                    <span className="flex-1">
                      {tasks[id].code}. {tasks[id].app}
                    </span>
                    <span className="text-xs whitespace-nowrap">{tasks[id].marks} Marks</span>
                    <StatusIcon status={taskStatus[id]} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>
      <section className="rounded-xl border border-line bg-info-soft/30 px-4 py-3">
        <h2 className="font-bold">Overall Progress</h2>
        <p className="mb-1 text-sm font-medium">
          {completion.completed} of {completion.total} Completed
        </p>
        <ProgressBar label="Overall progress" percent={completion.percent} />
        <ul className="mt-2 flex flex-wrap justify-between gap-x-2 gap-y-1 text-xs whitespace-nowrap">
          {(
            [
              ['Completed', 'bg-green-600'],
              ['In Progress', 'bg-blue-600'],
              ['Not Started', 'border border-muted'],
            ] as const
          ).map(([label, className]) => (
            <li key={label} className="flex items-center gap-1.5">
              <span className={clsx('size-3 rounded-full', className)} />
              {label}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
