import clsx from 'clsx';
import { useState } from 'react';
import { sectionTypes } from '@/shared/lib/examPattern';
import { RichText, Tabs } from '@/shared/ui';
import { getPatternProgress, type PaperSet, type PatternQuestion } from '../model/paper';

/** Read-only questions and answers of a set written to a pattern, one tab per part. */
export function PatternSections({ paper }: { paper: Pick<PaperSet, 'questions' | 'pattern'> }) {
  const sections = paper.pattern ?? [];
  const progress = getPatternProgress(paper);
  const [active, setActive] = useState(sections[0]?.id ?? '');

  const tabs = sections.map((section) => {
    const rows = progress.filter((row) => row.section.id === section.id);
    const count = rows.reduce((sum, row) => sum + row.questions.length, 0);
    const marks = rows.reduce(
      (sum, row) => sum + row.questions.length * row.group.marksPerQuestion,
      0,
    );
    return {
      id: section.id,
      label: `${section.name}${section.title ? ` – ${section.title}` : ''} (${count} Questions, ${marks} Marks)`,
    };
  });

  const shown = progress.filter((row) => row.section.id === active);
  const starts = shown.map((_row, index) =>
    shown.slice(0, index).reduce((sum, row) => sum + row.questions.length, 0),
  );
  return (
    <Tabs label="Paper sections" variant="solid" active={active} onChange={setActive} tabs={tabs}>
      <div
        tabIndex={0}
        role="group"
        aria-label="Questions"
        className="max-h-[32rem] overflow-y-auto"
      >
        {shown.map(({ group, questions }, rowIndex) => (
          <section key={group.id} className="mb-6 last:mb-0">
            <h3 className="mb-3 border-b border-line pb-2 font-bold">
              {sectionTypes[group.type].label}{' '}
              <span className="text-sm font-normal text-muted">
                ({questions.length} × {group.marksPerQuestion} marks)
              </span>
            </h3>
            {questions.length === 0 ? (
              <p className="text-muted">None written yet.</p>
            ) : (
              <ol className="space-y-5">
                {questions.map((question, index) => {
                  const number = (starts[rowIndex] ?? 0) + index + 1;
                  return (
                    <li key={question.id}>
                      <p className="mb-2 flex justify-between gap-4 font-semibold">
                        <span className="whitespace-pre-wrap">
                          Q{number}. {question.text}
                        </span>
                        <span className="shrink-0 pr-2 text-sm font-normal text-muted">
                          {group.marksPerQuestion} marks
                        </span>
                      </p>
                      <AnswerKey question={question} />
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        ))}
      </div>
    </Tabs>
  );
}

function AnswerKey({ question }: { question: PatternQuestion }) {
  if (question.type === 'mcq') {
    return (
      <ul>
        {(question.options ?? []).map((option, index) => {
          const isCorrect = index === question.correctIndex;
          return (
            <li
              key={index}
              className={clsx('rounded-md px-4 py-1.5', isCorrect && 'bg-success-soft font-medium')}
            >
              {String.fromCharCode(65 + index)}) {option}
              {isCorrect && <span className="sr-only"> (correct answer)</span>}
            </li>
          );
        })}
      </ul>
    );
  }
  if (question.type === 'match') {
    return (
      <table className="text-sm">
        <thead>
          <tr className="text-left text-muted">
            <th className="pr-8 font-medium">Column A</th>
            <th className="font-medium">Column B</th>
          </tr>
        </thead>
        <tbody>
          {(question.pairs ?? []).map((pair, index) => (
            <tr key={index}>
              <td className="pr-8">{pair.left}</td>
              <td>{pair.right}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  if (sectionTypes[question.type].group === 'Practical') {
    return <RichText value={question.instructions ?? ''} className="text-ink/90" />;
  }
  if (!question.answer) return null;
  return (
    <p className="rounded-md bg-success-soft px-4 py-1.5 text-sm whitespace-pre-wrap">
      <span className="font-semibold">Answer: </span>
      {question.answer}
    </p>
  );
}
