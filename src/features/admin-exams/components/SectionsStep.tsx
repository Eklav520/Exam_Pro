import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Button, Card, ConfirmDialog, SelectField } from '@/shared/ui';
import type { ExamFormValues } from '../model/examSchema';
import { buildPreset, createSection, presetOptions } from '../model/patternPresets';
import { getPatternTotals } from '@/shared/lib/examPattern';
import { SectionCard } from './SectionCard';

/** The exam's pattern: any number of parts, each with one or more question types. */
export function SectionsStep() {
  const { control } = useFormContext<ExamFormValues>();
  // Sections have their own `id`, which the default keyName ("id") would overwrite.
  const sections = useFieldArray({ control, name: 'sections', keyName: 'fieldKey' });
  const values = useWatch({ control, name: 'sections' });
  const [preset, setPreset] = useState(presetOptions[0]?.value ?? '');
  const [isReplacing, setIsReplacing] = useState(false);
  const totals = getPatternTotals(values);

  const applyPreset = () => {
    sections.replace(buildPreset(preset));
    setIsReplacing(false);
  };

  return (
    <div className="space-y-5">
      <Card className="flex flex-wrap items-end gap-3">
        <SelectField
          label="Start from a pattern"
          value={preset}
          options={presetOptions}
          onChange={setPreset}
          className="min-w-64 flex-1"
        />
        <Button
          variant="secondary"
          onClick={() => (values.length > 0 ? setIsReplacing(true) : applyPreset())}
        >
          Use Pattern
        </Button>
        <p className="basis-full text-sm text-muted">
          Or add sections one by one. A section can mix question types, e.g. MCQs and fill in the
          blanks, or Word, Excel and PowerPoint tasks.
        </p>
      </Card>

      {sections.fields.map((field, index) => (
        <SectionCard
          key={field.fieldKey}
          index={index}
          count={sections.fields.length}
          onMove={(to) => sections.move(index, to)}
          onRemove={() => sections.remove(index)}
        />
      ))}

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-line p-4">
        <Button variant="secondary" onClick={() => sections.append(createSection(values.length))}>
          <Plus aria-hidden className="size-4" />
          Add Section
        </Button>
        <p className="ml-auto font-semibold">
          {values.length} {values.length === 1 ? 'section' : 'sections'} · {totals.questions}{' '}
          questions · {totals.marks} marks
        </p>
      </div>

      <ConfirmDialog
        open={isReplacing}
        title="Replace the current sections?"
        confirmLabel="Replace"
        onConfirm={applyPreset}
        onCancel={() => setIsReplacing(false)}
      >
        The {values.length} sections you have added will be replaced by this pattern.
      </ConfirmDialog>
    </div>
  );
}
