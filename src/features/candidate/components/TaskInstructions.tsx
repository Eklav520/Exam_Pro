import { Download } from 'lucide-react';
import { IconButton, usePreviewAction } from '@/shared/ui';
import type { PracticalTask } from '../data/sample';
import { AppIcon } from './AppIcon';

export function TaskInstructions({ task }: { task: PracticalTask }) {
  const preview = usePreviewAction();
  return (
    <section className="flex flex-col rounded-xl border border-line p-4 lg:overflow-y-auto">
      <h2 className="mb-3 flex items-center gap-3 font-bold">
        <AppIcon task={task.id} />
        Task Instructions
      </h2>
      <p className="rounded-lg bg-info-soft/50 px-3 py-2.5 font-bold">
        {task.code}. {task.app} – {task.title} ({task.marks} Marks)
      </p>
      <p className="my-3 text-sm">{task.intro}</p>
      <ol className="list-decimal space-y-2.5 pb-4 pl-5 text-sm">
        {task.steps.map((step) => (
          <li key={step.text}>
            <strong>{step.text}</strong> {step.detail}
          </li>
        ))}
      </ol>
      <div className="mt-auto flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-sm font-semibold">
        <span className="min-w-0 break-words">Input File : {task.inputFile}</span>
        <IconButton
          icon={Download}
          label={`Download ${task.inputFile}`}
          onClick={() => preview(`Download ${task.inputFile}`)}
        />
      </div>
    </section>
  );
}
