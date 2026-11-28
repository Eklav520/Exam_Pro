import { useId, useState, type FormEvent } from 'react';
import { sectionTypes } from '@/shared/lib/examPattern';
import type { QuestionGroup, SectionType } from '@/shared/types';
import { htmlToText } from '@/shared/lib/richText';
import { Button, Field, Modal, RichTextEditor } from '@/shared/ui';
import { marksEach, type MatchPair, type PatternQuestion } from '../../model/paper';

const OPTION_COUNT = 4;
const PAIR_COUNT = 4;
const BLANK = /_{3,}/;

export type PatternQuestionValues = Omit<PatternQuestion, 'id' | 'groupId' | 'type'>;

type Kind = 'mcq' | 'true_false' | 'fill_blank' | 'match' | 'written' | 'practical';

function kindOf(type: SectionType): Kind {
  if (type === 'short_answer' || type === 'descriptive') return 'written';
  if (sectionTypes[type].group === 'Practical') return 'practical';
  return type as Kind;
}

const textLabel: Record<Kind, string> = {
  mcq: 'Question',
  true_false: 'Statement',
  fill_blank: 'Sentence',
  match: 'Instruction',
  written: 'Question',
  practical: 'Task Title',
};

interface Draft {
  text: string;
  options: string[];
  correctIndex: string;
  answer: string;
  pairs: MatchPair[];
  instructions: string;
}

type Errors = Partial<Record<string, string>>;

function validate(kind: Kind, draft: Draft): Errors {
  const errors: Errors = {};
  if (!draft.text.trim()) errors.text = `Enter the ${textLabel[kind].toLowerCase()}`;
  if (kind === 'mcq') {
    const seen = new Set<string>();
    draft.options.forEach((option, index) => {
      const value = option.trim().toLowerCase();
      if (!value) errors[`option${index}`] = 'Enter this option';
      else if (seen.has(value)) errors[`option${index}`] = 'This option is already used';
      seen.add(value);
    });
    if (draft.correctIndex === '') errors.correctIndex = 'Choose the correct answer';
  }
  if (kind === 'true_false' && !draft.answer) errors.answer = 'Choose the correct answer';
  if (kind === 'fill_blank') {
    if (draft.text.trim() && !BLANK.test(draft.text)) {
      errors.text = 'Mark the blank with ___ (three underscores)';
    }
    if (!draft.answer.trim()) errors.answer = 'Enter the word(s) that fill the blank';
  }
  if (kind === 'match') {
    draft.pairs.forEach((pair, index) => {
      if (!pair.left.trim() || !pair.right.trim()) errors[`pair${index}`] = 'Fill in both sides';
    });
  }
  if (kind === 'practical' && !htmlToText(draft.instructions).trim()) {
    errors.instructions = 'Enter what the candidate must do';
  }
  return errors;
}

function toValues(kind: Kind, draft: Draft): PatternQuestionValues {
  const text = draft.text.trim();
  switch (kind) {
    case 'mcq':
      return {
        text,
        options: draft.options.map((option) => option.trim()),
        correctIndex: Number(draft.correctIndex),
      };
    case 'true_false':
      return { text, answer: draft.answer };
    case 'fill_blank':
      return { text, answer: draft.answer.trim() };
    case 'match':
      return {
        text,
        pairs: draft.pairs.map((pair) => ({ left: pair.left.trim(), right: pair.right.trim() })),
      };
    case 'written':
      return { text, ...(draft.answer.trim() && { answer: draft.answer.trim() }) };
    case 'practical':
      return { text, instructions: draft.instructions };
  }
}

interface PatternQuestionDialogProps {
  group: QuestionGroup;
  /** "Part A – Q3", shown in the title. */
  slot: string;
  /** Null when adding. */
  item: PatternQuestion | null;
  onSave: (values: PatternQuestionValues) => void;
  onClose: () => void;
}

/** Writes one question of the pattern; its fields follow the question type. */
export function PatternQuestionDialog({
  group,
  slot,
  item,
  onSave,
  onClose,
}: PatternQuestionDialogProps) {
  const titleId = useId();
  const kind = kindOf(group.type);
  const [draft, setDraft] = useState<Draft>(() => ({
    text: item?.text ?? (kind === 'match' ? 'Match the items in Column A with Column B.' : ''),
    options: Array.from({ length: OPTION_COUNT }, (_value, index) => item?.options?.[index] ?? ''),
    correctIndex: item?.correctIndex === undefined ? '' : String(item.correctIndex),
    answer: item?.answer ?? '',
    pairs: Array.from(
      { length: PAIR_COUNT },
      (_value, index) => item?.pairs?.[index] ?? { left: '', right: '' },
    ),
    instructions: item?.instructions ?? '',
  }));
  const [errors, setErrors] = useState<Errors>({});

  const change = (update: Partial<Draft>) => setDraft({ ...draft, ...update });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validate(kind, draft);
    setErrors(found);
    if (Object.keys(found).length === 0) onSave(toValues(kind, draft));
  };

  const word = kind === 'practical' ? 'Task' : 'Question';

  return (
    <Modal
      open
      titleId={titleId}
      onClose={onClose}
      className="max-h-[92dvh] w-[95vw]! max-w-6xl! overflow-y-auto backdrop:backdrop-blur-sm lg:w-[80vw]!"
    >
      <h2 id={titleId} className="text-lg font-bold">
        {item ? 'Edit' : 'Add'} {word} – {slot}
      </h2>
      <p className="mb-4 text-sm text-muted">
        {sectionTypes[group.type].label} · {marksEach(group)}
      </p>
      <form noValidate className="space-y-4" onSubmit={handleSubmit}>
        {kind === 'practical' ? (
          <Field label="Task Title" required error={errors.text}>
            {(props) => (
              <input
                {...props}
                value={draft.text}
                placeholder="e.g. Format a government circular"
                onChange={(event) => change({ text: event.target.value })}
              />
            )}
          </Field>
        ) : (
          <Field
            label={textLabel[kind]}
            required
            error={errors.text}
            hint={
              kind === 'fill_blank'
                ? 'Type ___ where the candidate fills in the answer.'
                : undefined
            }
          >
            {(props) => (
              <textarea
                {...props}
                rows={kind === 'written' ? 3 : 2}
                value={draft.text}
                onChange={(event) => change({ text: event.target.value })}
              />
            )}
          </Field>
        )}

        {kind === 'mcq' && (
          <fieldset className="space-y-2">
            <legend className="mb-1.5 text-sm font-medium">
              Options (select the correct answer)
            </legend>
            {draft.options.map((option, index) => {
              const letter = String.fromCharCode(65 + index);
              const error = errors[`option${index}`];
              return (
                <div key={letter}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correct"
                      checked={draft.correctIndex === String(index)}
                      aria-label={`${letter} is correct`}
                      className="size-4.5 accent-brand-700"
                      onChange={() => change({ correctIndex: String(index) })}
                    />
                    <span className="font-semibold">{letter}</span>
                    <input
                      aria-label={`Option ${letter}`}
                      aria-invalid={Boolean(error)}
                      className="control"
                      value={option}
                      onChange={(event) =>
                        change({
                          options: draft.options.map((value, at) =>
                            at === index ? event.target.value : value,
                          ),
                        })
                      }
                    />
                  </div>
                  {error && <p className="mt-1 ml-14 text-sm text-danger">{error}</p>}
                </div>
              );
            })}
            {errors.correctIndex && <p className="text-sm text-danger">{errors.correctIndex}</p>}
          </fieldset>
        )}

        {kind === 'true_false' && (
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">Correct Answer</legend>
            <div className="flex gap-6">
              {['True', 'False'].map((value) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="answer"
                    checked={draft.answer === value}
                    className="size-4.5 accent-brand-700"
                    onChange={() => change({ answer: value })}
                  />
                  {value}
                </label>
              ))}
            </div>
            {errors.answer && <p className="mt-1 text-sm text-danger">{errors.answer}</p>}
          </fieldset>
        )}

        {kind === 'fill_blank' && (
          <Field label="Answer" required error={errors.answer}>
            {(props) => (
              <input
                {...props}
                value={draft.answer}
                onChange={(event) => change({ answer: event.target.value })}
              />
            )}
          </Field>
        )}

        {kind === 'match' && (
          <fieldset className="space-y-2">
            <legend className="mb-1.5 text-sm font-medium">
              Pairs (write each matching pair on one row; candidates see Column B shuffled)
            </legend>
            {draft.pairs.map((pair, index) => {
              const error = errors[`pair${index}`];
              const setPair = (update: Partial<MatchPair>) =>
                change({
                  pairs: draft.pairs.map((value, at) =>
                    at === index ? { ...value, ...update } : value,
                  ),
                });
              return (
                <div key={index}>
                  <div className="grid grid-cols-[1.5rem_1fr_1fr] items-center gap-3">
                    <span className="font-semibold">{index + 1}</span>
                    <input
                      aria-label={`Column A, pair ${index + 1}`}
                      aria-invalid={Boolean(error)}
                      className="control"
                      value={pair.left}
                      onChange={(event) => setPair({ left: event.target.value })}
                    />
                    <input
                      aria-label={`Column B, pair ${index + 1}`}
                      aria-invalid={Boolean(error)}
                      className="control"
                      value={pair.right}
                      onChange={(event) => setPair({ right: event.target.value })}
                    />
                  </div>
                  {error && <p className="mt-1 ml-9 text-sm text-danger">{error}</p>}
                </div>
              );
            })}
          </fieldset>
        )}

        {kind === 'written' && (
          <Field label="Model Answer / Key Points" hint="Optional. Helps evaluators mark.">
            {(props) => (
              <textarea
                {...props}
                rows={4}
                value={draft.answer}
                onChange={(event) => change({ answer: event.target.value })}
              />
            )}
          </Field>
        )}

        {kind === 'practical' && (
          <RichTextEditor
            label="Instructions"
            required
            value={draft.instructions}
            error={errors.instructions}
            hint="Select text to make it bold, underline or highlight it, or add a list."
            placeholder="Step-by-step instructions for the candidate…"
            onChange={(instructions) => change({ instructions })}
          />
        )}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save {word}</Button>
        </div>
      </form>
    </Modal>
  );
}
