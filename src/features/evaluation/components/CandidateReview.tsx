import { useState } from 'react';
import { Card, DataTable, SelectField } from '@/shared/ui';
import type { CandidateResult } from '../data/sample';
import { toMarks } from '../model/marks';

interface CandidateReviewProps {
  candidates: CandidateResult[];
  selected: CandidateResult;
  onSelect: (registrationNo: string) => void;
}

export function CandidateReview({ candidates, selected, onSelect }: CandidateReviewProps) {
  return (
    <Card className="space-y-5">
      <SelectField
        label="Candidate"
        value={selected.registrationNo}
        options={candidates.map(({ registrationNo, name }) => ({
          value: registrationNo,
          label: `${registrationNo} – ${name}`,
        }))}
        onChange={onSelect}
        className="max-w-sm"
      />
      <SectionMarks key={selected.registrationNo} candidate={selected} />
    </Card>
  );
}

function SectionMarks({ candidate }: { candidate: CandidateResult }) {
  const [finalMarks, setFinalMarks] = useState(() =>
    Object.fromEntries(
      candidate.sections.map((section) => [section.name, String(section.evaluatorMarks)]),
    ),
  );
  const total = candidate.sections.reduce(
    (sum, section) => sum + toMarks(finalMarks[section.name], section.maxMarks),
    0,
  );

  return (
    <>
      <DataTable
        caption={`Marks for ${candidate.name}`}
        rows={candidate.sections}
        getRowKey={(section) => section.name}
        columns={[
          { header: 'Section', cell: (section) => section.name },
          { header: 'Maximum Marks', align: 'center', cell: (section) => section.maxMarks },
          { header: 'Evaluator Marks', align: 'center', cell: (section) => section.evaluatorMarks },
          {
            header: 'Final Marks',
            align: 'center',
            cell: (section) => (
              <input
                type="number"
                min={0}
                max={section.maxMarks}
                step="any"
                aria-label={`Final marks for ${section.name}`}
                className="control mx-auto w-24 text-center"
                value={finalMarks[section.name]}
                onChange={(event) =>
                  setFinalMarks({ ...finalMarks, [section.name]: event.target.value })
                }
              />
            ),
          },
        ]}
      />
      <p className="text-right font-bold">Final marks: {total}</p>
    </>
  );
}
