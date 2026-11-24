import clsx from 'clsx';
import { Download } from 'lucide-react';
import { useState } from 'react';
import type { PaperSet } from '@/features/question-papers';
import { Badge, Button, Tabs, usePreviewAction } from '@/shared/ui';
import { sectionA, sectionB } from '../data/sample';

const tabs = [
  { id: 'a', label: sectionA.label },
  { id: 'b', label: sectionB.label },
] as const;

export function PaperPreview({ paper }: { paper: PaperSet }) {
  const preview = usePreviewAction();
  const [section, setSection] = useState<'a' | 'b'>('a');

  return (
    <section className="min-w-0 rounded-xl border border-line p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="mb-2 font-bold">Paper Set Preview – {paper.name}</h2>
          <div className="flex flex-wrap gap-2">
            <Badge tone="info">{paper.exam}</Badge>
            <Badge tone="violet">
              Total: {paper.totalQuestions} Questions | {paper.totalMarks} Marks
            </Badge>
          </div>
        </div>
        <Button size="sm" onClick={() => preview(`Download ${paper.name}`)}>
          <Download aria-hidden className="size-4" />
          Download
        </Button>
      </div>
      <Tabs
        label="Paper sections"
        variant="solid"
        tabs={tabs}
        active={section}
        onChange={setSection}
      >
        <div tabIndex={0} role="group" aria-label="Questions" className="max-h-96 overflow-y-auto">
          {section === 'a' ? <McqSection /> : <PracticalSection />}
        </div>
      </Tabs>
    </section>
  );
}

function McqSection() {
  return (
    <ol className="space-y-6">
      {sectionA.questions.map((question, index) => (
        <li key={question.text}>
          <p className="mb-2 font-semibold">
            Q{index + 1}. {question.text}
          </p>
          <ul>
            {question.options.map((option, optionIndex) => {
              const isCorrect = optionIndex === question.correctIndex;
              return (
                <li
                  key={option}
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

function PracticalSection() {
  return (
    <ol className="space-y-3">
      {sectionB.tasks.map((task) => (
        <li key={task.title} className="rounded-lg border border-line px-4 py-3">
          <p className="flex justify-between font-semibold">
            {task.title}
            <span>{task.marks} marks</span>
          </p>
          <p className="mt-1 text-muted">{task.text}</p>
        </li>
      ))}
    </ol>
  );
}
