import clsx from 'clsx';
import { ArrowDown, ArrowUp, Trash2, X } from 'lucide-react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import type { SectionType } from '@/shared/types';
import { Badge, Card, Field, IconButton } from '@/shared/ui';
import type { ExamFormValues } from '../model/examSchema';
import { createGroup } from '../model/patternPresets';
import {
  getMarking,
  getSectionTotals,
  groupMarks,
  isObjective,
  itemWord,
  sectionGroups,
  sectionTypeIds,
  sectionTypes,
  type Marking,
} from '@/shared/lib/examPattern';

const markings: Record<Marking, { label: string; tone: 'info' | 'violet' | 'warning' }> = {
  auto: { label: 'Marked automatically', tone: 'info' },
  evaluator: { label: 'Marked by evaluator', tone: 'violet' },
  mixed: { label: 'Partly marked by evaluator', tone: 'warning' },
};

interface SectionCardProps {
  index: number;
  count: number;
  onMove: (to: number) => void;
  onRemove: () => void;
}

/** One part of the pattern, with one or more question types. */
export function SectionCard({ index, count, onMove, onRemove }: SectionCardProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ExamFormValues>();
  // Groups have their own `id`, which the default keyName ("id") would overwrite.
  const groups = useFieldArray({ control, name: `sections.${index}.groups`, keyName: 'fieldKey' });
  const section = useWatch({ control, name: `sections.${index}` });
  const sectionErrors = errors.sections?.[index];
  const groupsError = sectionErrors?.groups?.root?.message ?? sectionErrors?.groups?.message;
  const totals = getSectionTotals(section);
  const marking = markings[getMarking(section)];
  const name = section.name || `Section ${index + 1}`;
  const selectedTypes = new Set(section.groups.map((group) => group.type));

  /** Ticking a type adds a row for it; unticking removes that row. */
  const toggleType = (type: SectionType) => {
    const at = section.groups.findIndex((group) => group.type === type);
    if (at === -1) groups.append(createGroup(type));
    else groups.remove(at);
  };

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h3 className="font-bold">
          {name}
          {section.title && <span className="font-medium text-muted"> – {section.title}</span>}
        </h3>
        {section.groups.length > 0 && <Badge tone={marking.tone}>{marking.label}</Badge>}
        <span className="ml-auto flex gap-1">
          <IconButton
            icon={ArrowUp}
            label={`Move ${name} up`}
            disabled={index === 0}
            onClick={() => onMove(index - 1)}
          />
          <IconButton
            icon={ArrowDown}
            label={`Move ${name} down`}
            disabled={index === count - 1}
            onClick={() => onMove(index + 1)}
          />
          <IconButton icon={Trash2} danger label={`Remove ${name}`} onClick={onRemove} />
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
        <Field label="Part" required error={sectionErrors?.name?.message}>
          {(props) => <input {...props} {...register(`sections.${index}.name`)} />}
        </Field>
        <Field label="Section Title" error={sectionErrors?.title?.message}>
          {(props) => (
            <input
              {...props}
              placeholder="e.g. General Studies"
              {...register(`sections.${index}.title`)}
            />
          )}
        </Field>
      </div>

      <fieldset className="mt-5">
        <legend className="mb-1 text-sm font-semibold">Question Types in {name}</legend>
        <p className="mb-3 text-sm text-muted">
          Select one or more. Each selected type gets its own number of questions and marks.
        </p>
        <div className="mb-4 grid gap-3 lg:grid-cols-3">
          {sectionGroups.map((kind) => (
            <div key={kind} className="rounded-lg border border-line p-3">
              <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">
                {kind}
              </p>
              <div className="flex flex-wrap gap-2">
                {sectionTypeIds
                  .filter((id) => sectionTypes[id].group === kind)
                  .map((id) => {
                    const isSelected = selectedTypes.has(id);
                    return (
                      <label
                        key={id}
                        className={clsx(
                          'flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm',
                          isSelected
                            ? 'border-brand-700 bg-brand-50 font-semibold text-brand-800'
                            : 'border-line hover:bg-canvas',
                        )}
                      >
                        <input
                          type="checkbox"
                          className="size-4 accent-brand-700"
                          checked={isSelected}
                          onChange={() => toggleType(id)}
                        />
                        {sectionTypes[id].label}
                      </label>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {groups.fields.map((field, groupIndex) => {
            const group = section.groups[groupIndex] ?? field;
            const groupErrors = sectionErrors?.groups?.[groupIndex];
            const objective = isObjective(group.type);
            const at = `sections.${index}.groups.${groupIndex}` as const;
            return (
              <div
                key={field.fieldKey}
                role="group"
                aria-label={`${sectionTypes[group.type].label} in ${name}`}
                className="grid items-start gap-3 rounded-lg border border-line bg-canvas/50 p-3 sm:grid-cols-2 xl:grid-cols-[1.6fr_7rem_7rem_8rem_6rem_auto]"
              >
                <div className="space-y-1.5">
                  <span className="block text-sm font-medium">Question Type</span>
                  <span className="flex items-center gap-2 py-2.5 font-semibold">
                    {sectionTypes[group.type].label}
                    <Badge tone={objective ? 'info' : 'violet'}>
                      {sectionTypes[group.type].group}
                    </Badge>
                  </span>
                </div>
                <Field
                  label={sectionTypes[group.type].group === 'Practical' ? 'Tasks' : 'Questions'}
                  required
                  error={groupErrors?.questionCount?.message}
                >
                  {(props) => (
                    <input
                      {...props}
                      type="number"
                      min={1}
                      {...register(`${at}.questionCount`, { valueAsNumber: true })}
                    />
                  )}
                </Field>
                <Field label="Marks Each" required error={groupErrors?.marksPerQuestion?.message}>
                  {(props) => (
                    <input
                      {...props}
                      type="number"
                      step="any"
                      min={0}
                      {...register(`${at}.marksPerQuestion`, { valueAsNumber: true })}
                    />
                  )}
                </Field>
                <Field
                  label="Negative Marks"
                  error={groupErrors?.negativeMarks?.message}
                  hint={objective ? 'Per wrong answer' : 'Not applicable'}
                >
                  {(props) => (
                    <input
                      {...props}
                      type="number"
                      step="any"
                      min={0}
                      disabled={!objective}
                      {...register(`${at}.negativeMarks`, { valueAsNumber: true })}
                    />
                  )}
                </Field>
                <div className="space-y-1.5">
                  <span className="block text-sm font-medium">Marks</span>
                  <span className="block py-2.5 font-semibold">{groupMarks(group)}</span>
                </div>
                <IconButton
                  icon={X}
                  danger
                  label={`Remove ${sectionTypes[group.type].label} from ${name}`}
                  className="xl:mt-8"
                  onClick={() => groups.remove(groupIndex)}
                />
              </div>
            );
          })}
        </div>
        {groupsError && <p className="mt-2 text-sm text-danger">{groupsError}</p>}
      </fieldset>

      <div className="mt-4">
        <Field label="Instructions" hint="Shown to candidates at the start of this section.">
          {(props) => (
            <textarea {...props} rows={2} {...register(`sections.${index}.instructions`)} />
          )}
        </Field>
      </div>

      <p className="mt-3 text-sm font-medium">
        {name}:{' '}
        {section.groups
          .map((group) => itemWord(group.type, group.questionCount || 0))
          .join(' + ') || 'no questions'}{' '}
        = {totals.marks} marks
      </p>
    </Card>
  );
}
