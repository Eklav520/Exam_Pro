import {
  getPatternTotals,
  getSectionTotals,
  groupMarks,
  isObjective,
  sectionTypes,
} from '@/shared/lib/examPattern';
import { formatDate } from '@/shared/lib/format';
import { Card, Field, SelectField } from '@/shared/ui';
import { sampleExams } from '../../data/sample';
import type { PaperSet } from '../../model/paper';

interface DetailsStepProps {
  paper: PaperSet;
  titleError: string | undefined;
  onExamChange: (exam: string) => void;
  onTitleChange: (title: string) => void;
}

export function DetailsStep({ paper, titleError, onExamChange, onTitleChange }: DetailsStepProps) {
  // A set the Admin assigned belongs to its exam for good.
  const isAssigned = paper.examId !== undefined;
  const pattern = paper.pattern ?? [];
  const totals = getPatternTotals(pattern);

  return (
    <div className="space-y-5">
      <Card className="grid gap-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_2fr]">
        {isAssigned ? (
          <Field label="Examination" hint="Assigned by the Admin.">
            {(props) => <input {...props} value={paper.exam} readOnly />}
          </Field>
        ) : (
          <SelectField
            label="Examination"
            value={paper.exam}
            options={sampleExams}
            onChange={onExamChange}
          />
        )}
        <Field
          label="Paper Set"
          hint={
            paper.dueDate
              ? `Send for approval by ${formatDate(paper.dueDate)}.`
              : 'Numbered automatically for each examination.'
          }
        >
          {(props) => <input {...props} value={paper.name} readOnly />}
        </Field>
        <div className="sm:col-span-2 lg:col-span-1">
          <Field label="Paper Title" required error={titleError}>
            {(props) => (
              <input
                {...props}
                value={paper.title}
                onChange={(event) => onTitleChange(event.target.value)}
              />
            )}
          </Field>
        </div>
      </Card>
      {pattern.length > 0 && (
        <Card className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-bold">Exam Pattern to Follow</h2>
            <p className="text-sm text-muted">
              Set by the Admin ·{' '}
              <span className="font-semibold text-ink">
                {totals.questions} questions · {totals.marks} marks
              </span>
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border border-line">
            <table className="w-full text-sm">
              <caption className="sr-only">Exam pattern</caption>
              <thead className="bg-table-head text-left">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-semibold">
                    Question Type
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-center font-semibold">
                    Questions
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-center font-semibold">
                    Marks Each
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 py-2.5 text-center font-semibold sm:table-cell"
                  >
                    Negative
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold">
                    Marks
                  </th>
                </tr>
              </thead>
              {pattern.map((section) => {
                const sectionTotals = getSectionTotals(section);
                return (
                  <tbody key={section.id} className="border-t border-line">
                    <tr className="bg-canvas">
                      <th scope="rowgroup" colSpan={5} className="px-4 py-2 text-left">
                        <span className="font-semibold">
                          {section.name}
                          {section.title && ` – ${section.title}`}
                        </span>
                        <span className="ml-2 font-normal text-muted">
                          {sectionTotals.questions} questions · {sectionTotals.marks} marks
                        </span>
                      </th>
                    </tr>
                    {section.groups.map((group) => (
                      <tr key={group.id} className="border-t border-line">
                        <td className="px-4 py-2.5 pl-8">{sectionTypes[group.type].label}</td>
                        <td className="px-4 py-2.5 text-center tabular-nums">
                          {group.questionCount}
                        </td>
                        <td className="px-4 py-2.5 text-center tabular-nums">
                          {group.marksPerQuestion}
                        </td>
                        <td className="hidden px-4 py-2.5 text-center tabular-nums sm:table-cell">
                          {isObjective(group.type) && group.negativeMarks > 0
                            ? `−${group.negativeMarks}`
                            : '–'}
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                          {groupMarks(group)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                );
              })}
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
