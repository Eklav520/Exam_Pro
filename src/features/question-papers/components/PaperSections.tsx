import clsx from 'clsx';
import { useState } from 'react';
import { Tabs } from '@/shared/ui';
import { getPaperTotals, type McqItem, type PaperSet, type PracticalItem } from '../model/paper';

/** Read-only questions and answers of a set, for reviewing. */
export function PaperSections({ paper }: { paper: Pick<PaperSet, 'mcqs' | 'tasks'> }) {
  const { mcqs, tasks } = paper;
  const totals = getPaperTotals(paper);
  const [section, setSection] = useState<'a' | 'b'>(mcqs.length === 0 ? 'b' : 'a');

  return (
    <Tabs
      label="Paper sections"
      variant="solid"
      active={section}
      onChange={setSection}
      tabs={[
        { id: 'a', label: `Section A – MCQ (${mcqs.length} Questions, ${totals.mcqMarks} Marks)` },
        {
          id: 'b',
          label: `Section B – Practical (${tasks.length} Tasks, ${totals.taskMarks} Marks)`,
        },
      ]}
    >
      <div tabIndex={0} role="group" aria-label="Questions" className="max-h-96 overflow-y-auto">
        {section === 'a' ? <McqList mcqs={mcqs} /> : <TaskList tasks={tasks} />}
      </div>
    </Tabs>
  );
}

function McqList({ mcqs }: { mcqs: McqItem[] }) {
  if (mcqs.length === 0) return <p className="text-muted">No multiple choice questions.</p>;
  return (
    <ol className="space-y-6">
      {mcqs.map((question, index) => (
        <li key={question.id}>
          <p className="mb-2 flex justify-between gap-4 font-semibold">
            <span>
              Q{index + 1}. {question.text}
            </span>
            <span className="shrink-0 pr-2 text-sm font-normal text-muted">
              {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
            </span>
          </p>
          <ul>
            {question.options.map((option, optionIndex) => {
              const isCorrect = optionIndex === question.correctIndex;
              return (
                <li
                  key={optionIndex}
                  className={clsx(
                    'flex items-center gap-4 rounded-md px-4 py-2',
                    isCorrect && 'bg-success-soft',
                  )}
                >
                  <span
                    aria-hidden
                    className={clsx(
                      'size-5 shrink-0 rounded-full',
                      isCorrect ? 'border-6 border-brand-700 bg-surface' : 'border-2 border-muted',
                    )}
                  />
                  {String.fromCharCode(65 + optionIndex)}) {option}
                  {isCorrect && <span className="sr-only">(correct answer)</span>}
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ol>
  );
}

function TaskList({ tasks }: { tasks: PracticalItem[] }) {
  if (tasks.length === 0) return <p className="text-muted">No practical tasks.</p>;
  return (
    <ol className="space-y-3">
      {tasks.map((task, index) => (
        <li key={task.id} className="rounded-lg border border-line px-4 py-3">
          <p className="flex justify-between gap-4 font-semibold">
            <span>
              B{index + 1}. {task.app} – {task.title}
            </span>
            <span className="shrink-0">{task.marks} marks</span>
          </p>
          <p className="mt-1 whitespace-pre-wrap text-muted">{task.instructions}</p>
        </li>
      ))}
    </ol>
  );
}
