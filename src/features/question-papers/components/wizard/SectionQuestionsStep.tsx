import { CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react';
import { sectionTypes } from '@/shared/lib/examPattern';
import type { ExamSection, QuestionGroup } from '@/shared/types';
import { Badge, Button, Card, DataTable, IconButton, ProgressBar } from '@/shared/ui';
import { answerSummary } from '../../model/answerSummary';
import {
  getPatternProgress,
  marksEach,
  type PaperSet,
  type PatternQuestion,
} from '../../model/paper';

interface SectionQuestionsStepProps {
  paper: PaperSet;
  section: ExamSection;
  onAdd: (group: QuestionGroup, slot: string) => void;
  onEdit: (group: QuestionGroup, question: PatternQuestion, slot: string) => void;
  onDelete: (question: PatternQuestion) => void;
}

/** One part of the pattern: each question type with the questions written for it. */
export function SectionQuestionsStep({
  paper,
  section,
  onAdd,
  onEdit,
  onDelete,
}: SectionQuestionsStepProps) {
  const rows = getPatternProgress(paper).filter((row) => row.section.id === section.id);
  // Questions are numbered through the whole part, across its types.
  const starts = rows.map((_row, index) =>
    rows.slice(0, index).reduce((sum, row) => sum + row.group.questionCount, 0),
  );

  return (
    <div className="space-y-5">
      {section.instructions && (
        <p className="rounded-lg bg-info-soft px-4 py-3 text-sm">
          <span className="font-semibold">Instructions to candidates: </span>
          {section.instructions}
        </p>
      )}
      {rows.map(({ group, questions, missing }, rowIndex) => {
        const start = starts[rowIndex] ?? 0;
        const label = sectionTypes[group.type].label;
        const isPractical = sectionTypes[group.type].group === 'Practical';
        const word = isPractical ? 'Task' : 'Question';
        const prefix = isPractical ? 'T' : 'Q';
        const slot = (index: number) => `${section.name} – ${prefix}${start + index + 1}`;
        const isFull = missing === 0;
        const percent =
          group.questionCount > 0
            ? Math.round(
                (Math.min(questions.length, group.questionCount) / group.questionCount) * 100,
              )
            : 100;

        return (
          <Card key={group.id} className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-bold">
                  {label}
                  {isFull && <CheckCircle2 aria-label="Complete" className="size-5 text-success" />}
                </h2>
                <p className="text-sm text-muted">{marksEach(group)}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-48">
                  <p className="mb-1 text-sm font-medium">
                    {questions.length} of {group.questionCount} {word.toLowerCase()}s written
                  </p>
                  <ProgressBar label={`${label} progress`} percent={percent} />
                </div>
                <Button
                  disabled={isFull}
                  onClick={() => onAdd(group, slot(questions.length))}
                  aria-label={`Add ${label} ${word.toLowerCase()}`}
                >
                  <Plus aria-hidden className="size-4" />
                  Add {word}
                </Button>
              </div>
            </div>
            <DataTable
              caption={`${section.name} – ${label}`}
              rows={questions}
              getRowKey={(question) => question.id}
              emptyMessage={`No ${word.toLowerCase()}s yet. ${group.questionCount} to write.`}
              columns={[
                {
                  header: 'No.',
                  cell: (_question, index) => `${prefix}${start + index + 1}`,
                },
                {
                  header: word,
                  cell: (question) => (
                    <span className="block max-w-md truncate" title={question.text}>
                      {question.text}
                    </span>
                  ),
                },
                {
                  header: isPractical ? 'Instructions' : 'Answer',
                  cell: (question) => (
                    <span className="block max-w-xs truncate text-muted">
                      {answerSummary(question)}
                    </span>
                  ),
                },
                {
                  header: 'Actions',
                  align: 'center',
                  cell: (question, index) => (
                    <span className="inline-flex gap-1">
                      <IconButton
                        icon={Pencil}
                        label={`Edit ${slot(index)}`}
                        onClick={() => onEdit(group, question, slot(index))}
                      />
                      <IconButton
                        icon={Trash2}
                        danger
                        label={`Delete ${slot(index)}`}
                        onClick={() => onDelete(question)}
                      />
                    </span>
                  ),
                },
              ]}
            />
            {!isFull && questions.length > 0 && (
              <p className="text-right">
                <Badge tone="warning">
                  {missing} more {missing === 1 ? word.toLowerCase() : `${word.toLowerCase()}s`} to
                  write
                </Badge>
              </p>
            )}
          </Card>
        );
      })}
    </div>
  );
}
