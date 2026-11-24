import clsx from 'clsx';
import type { TaskId } from '../data/sample';

const styles: Record<TaskId, { letter: string; className: string }> = {
  word: { letter: 'W', className: 'bg-blue-700' },
  excel: { letter: 'X', className: 'bg-emerald-700' },
  powerpoint: { letter: 'P', className: 'bg-orange-600' },
};

export function AppIcon({ task, large = false }: { task: TaskId; large?: boolean }) {
  return (
    <span
      aria-hidden
      className={clsx(
        'inline-flex items-center justify-center font-bold text-white',
        large ? 'size-12 rounded-xl text-2xl' : 'size-8 rounded-lg',
        styles[task].className,
      )}
    >
      {styles[task].letter}
    </span>
  );
}
