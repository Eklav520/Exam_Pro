import { getPatternTotals, isObjective, sectionTypes } from '@/shared/lib/examPattern';
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
      <Card className="grid gap-5 sm:grid-cols-2">
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
        <div className="sm:col-span-2">
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
        <Card>
          <h2 className="mb-1 font-bold">Exam Pattern to Follow</h2>
          <p className="mb-3 text-sm text-muted">
            {totals.questions} questions · {totals.marks} marks, as set by the Admin.
          </p>
          <ul className="divide-y divide-line">
            {pattern.map((section) => (
              <li key={section.id} className="py-2.5">
                <p className="font-semibold">
                  {section.name}
                  {section.title && ` – ${section.title}`}
                </p>
                <ul className="text-sm text-muted">
                  {section.groups.map((group) => (
                    <li key={group.id}>
                      {sectionTypes[group.type].label}: {group.questionCount} ×{' '}
                      {group.marksPerQuestion} marks
                      {isObjective(group.type) && group.negativeMarks > 0
                        ? `, −${group.negativeMarks} per wrong answer`
                        : ''}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
