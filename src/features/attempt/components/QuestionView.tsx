import clsx from 'clsx';
import { formatNumber } from '@/shared/lib/format';
import type { PublicQuestion } from '@/shared/types';
import { Button, Card } from '@/shared/ui';

interface QuestionViewProps {
  question: PublicQuestion;
  number: number;
  total: number;
  selectedOptionIds: string[];
  isMarked: boolean;
  isLocked: boolean;
  onToggleOption: (optionId: string) => void;
  onClear: () => void;
  onToggleMark: () => void;
}

export function QuestionView({
  question,
  number,
  total,
  selectedOptionIds,
  isMarked,
  isLocked,
  onToggleOption,
  onClear,
  onToggleMark,
}: QuestionViewProps) {
  const isSingle = question.type === 'single';
  return (
    <Card>
      <p className="mb-3 flex justify-between text-sm text-muted">
        <span>
          Question {number} of {total}
        </span>
        <span>
          {formatNumber(question.marks)} {question.marks === 1 ? 'mark' : 'marks'}
        </span>
      </p>
      <fieldset disabled={isLocked}>
        <legend className="text-lg font-medium whitespace-pre-wrap">{question.text}</legend>
        <p className="mt-1 text-sm text-muted">
          {isSingle ? 'Choose one answer.' : 'Choose all that apply.'}
        </p>
        <div className="mt-4 space-y-2">
          {question.options.map((option) => {
            const isSelected = selectedOptionIds.includes(option.id);
            return (
              <label
                key={option.id}
                className={clsx(
                  'flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3',
                  isSelected ? 'border-brand-700 bg-brand-50' : 'border-line hover:bg-canvas',
                )}
              >
                <input
                  type={isSingle ? 'radio' : 'checkbox'}
                  name={question.id}
                  checked={isSelected}
                  onChange={() => onToggleOption(option.id)}
                  className="mt-1 accent-brand-700"
                />
                <span>{option.text}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          variant={isMarked ? 'primary' : 'secondary'}
          size="sm"
          aria-pressed={isMarked}
          onClick={onToggleMark}
        >
          {isMarked ? 'Marked for review' : 'Mark for review'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={isLocked || selectedOptionIds.length === 0}
          onClick={onClear}
        >
          Clear answer
        </Button>
      </div>
    </Card>
  );
}
