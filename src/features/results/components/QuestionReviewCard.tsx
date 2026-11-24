import clsx from 'clsx';
import { formatNumber } from '@/shared/lib/format';
import type { QuestionOutcome, QuestionReview } from '@/shared/types';
import { Badge, Card } from '@/shared/ui';

const outcomes: Record<QuestionOutcome, { label: string; tone: 'success' | 'danger' | 'neutral' }> =
  {
    correct: { label: 'Correct', tone: 'success' },
    incorrect: { label: 'Incorrect', tone: 'danger' },
    unanswered: { label: 'Not answered', tone: 'neutral' },
  };

interface QuestionReviewCardProps {
  number: number;
  review: QuestionReview;
}

export function QuestionReviewCard({ number, review }: QuestionReviewCardProps) {
  const { question, selectedOptionIds, outcome, marksAwarded } = review;
  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted">
        Question {number}
        <Badge tone={outcomes[outcome].tone}>{outcomes[outcome].label}</Badge>
        <span className="ml-auto tabular-nums">
          {formatNumber(marksAwarded)} / {formatNumber(question.marks)} marks
        </span>
      </div>
      <p className="font-medium whitespace-pre-wrap">{question.text}</p>
      <ul className="mt-3 space-y-2 text-sm">
        {question.options.map((option) => {
          const isCorrect = question.correctOptionIds.includes(option.id);
          const isSelected = selectedOptionIds.includes(option.id);
          return (
            <li
              key={option.id}
              className={clsx(
                'flex flex-wrap justify-between gap-2 rounded-md border px-3 py-2',
                isCorrect && 'border-success/40 bg-success-soft',
                !isCorrect && isSelected && 'border-danger/40 bg-danger-soft',
                !isCorrect && !isSelected && 'border-line',
              )}
            >
              <span>{option.text}</span>
              <span className="text-xs font-medium">
                {[isSelected && 'Your answer', isCorrect && 'Correct answer']
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </li>
          );
        })}
      </ul>
      {question.explanation && (
        <p className="mt-3 text-sm text-muted">
          <span className="font-medium text-ink">Explanation: </span>
          {question.explanation}
        </p>
      )}
    </Card>
  );
}
