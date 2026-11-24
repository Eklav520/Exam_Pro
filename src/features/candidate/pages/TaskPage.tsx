import { ArrowLeft, Check, CloudUpload, Save } from 'lucide-react';
import { useEffect, useState, type ComponentType } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { path } from '@/shared/config/paths';
import { Button, buttonClass, useToast } from '@/shared/ui';
import { SectionHeader } from '../components/SectionHeader';
import { SectionNavigator } from '../components/SectionNavigator';
import { SwitchSectionDialog } from '../components/SwitchSectionDialog';
import { TaskInstructions } from '../components/TaskInstructions';
import { ExcelWorkspace } from '../components/workspace/ExcelWorkspace';
import { PowerPointWorkspace } from '../components/workspace/PowerPointWorkspace';
import { WordWorkspace } from '../components/workspace/WordWorkspace';
import { isTaskId, tasks, type TaskId } from '../data/sample';
import { selectCandidate, taskCompleted, taskOpened } from '../model/candidateSlice';

const workspaces: Record<TaskId, ComponentType> = {
  word: WordWorkspace,
  excel: ExcelWorkspace,
  powerpoint: PowerPointWorkspace,
};

export function TaskPage() {
  const { taskId } = useParams();
  if (!isTaskId(taskId)) return <Navigate to={path.candidateHome} replace />;
  return <TaskScreen key={taskId} taskId={taskId} />;
}

function TaskScreen({ taskId }: { taskId: TaskId }) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { tasks: taskStatus, isSaving } = useAppSelector(selectCandidate);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    dispatch(taskOpened(taskId));
  }, [dispatch, taskId]);

  const task = tasks[taskId];
  const Workspace = workspaces[taskId];
  const isCompleted = taskStatus[taskId] === 'completed';

  const openSwitch = () => setIsSwitching(true);

  return (
    <div className="flex min-h-dvh flex-col bg-surface lg:h-dvh lg:min-h-160">
      <SectionHeader
        section="B"
        title={`Section B – Practical (${task.shortApp})`}
        facts={[`Task: ${task.code} – ${task.app}`, `Marks: ${task.marks}`]}
        currentTask={taskId}
        onSwitchSection={openSwitch}
      />
      <main className="flex w-full flex-1 flex-col px-4 py-3 lg:min-h-0 lg:px-6">
        <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[19rem_minmax(0,1fr)] lg:grid-rows-1 2xl:grid-cols-[19rem_minmax(0,1fr)_20rem]">
          <TaskInstructions task={task} />
          <Workspace />
          <aside className="hidden overflow-y-auto rounded-xl border border-line p-2 2xl:block">
            <SectionNavigator currentTask={taskId} onOpenSectionA={openSwitch} />
          </aside>
        </div>
      </main>
      <footer className="bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface px-4 py-3 sm:sticky lg:px-6">
        <Link to={path.candidateHome} className={buttonClass('secondary')}>
          <ArrowLeft aria-hidden className="size-4" />
          Back to Sections
        </Link>
        <p
          role="status"
          className="flex items-center gap-2 rounded-lg bg-info-soft/60 px-4 py-2 text-sm font-medium text-info"
        >
          <CloudUpload aria-hidden className="size-5" />
          {isSaving ? 'Auto-saving your work...' : 'All work auto-saved'}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => toast('Your work is saved.')}>
            <Save aria-hidden className="size-4" />
            Save
          </Button>
          <Button
            disabled={isCompleted}
            onClick={() => {
              dispatch(taskCompleted(taskId));
              toast(`${task.code}. ${task.app} is marked as completed.`);
            }}
          >
            {isCompleted ? 'Completed' : 'Mark as Completed'}
            <Check aria-hidden className="size-4" />
          </Button>
        </div>
      </footer>
      <SwitchSectionDialog open={isSwitching} current="b" onClose={() => setIsSwitching(false)} />
    </div>
  );
}
