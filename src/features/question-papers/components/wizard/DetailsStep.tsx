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
  return (
    <Card className="grid gap-5 sm:grid-cols-2">
      <SelectField
        label="Examination"
        value={paper.exam}
        options={sampleExams}
        onChange={onExamChange}
      />
      <Field label="Paper Set" hint="Numbered automatically for each examination.">
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
  );
}
