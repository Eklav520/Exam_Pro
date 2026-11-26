import { useFormContext, useWatch } from 'react-hook-form';
import { formatDate } from '@/shared/lib/format';
import { Badge, Card } from '@/shared/ui';
import type { ExamFormValues } from '../model/examSchema';
import { getPatternTotals, groupMarks, isObjective, sectionTypes } from '../model/sectionTypes';

export function ReviewStep() {
  const { control } = useFormContext<ExamFormValues>();
  const exam = useWatch({ control }) as ExamFormValues;
  const totals = getPatternTotals(exam.sections);

  const facts = [
    ['Title', exam.title || '–'],
    ['Subject', exam.subject || '–'],
    ['Notification No.', exam.notificationNo || '–'],
    ['Exam Date', exam.examDate ? formatDate(exam.examDate) : 'Not fixed yet'],
    ['Duration', `${exam.durationMinutes} minutes`],
    ['Pass mark', `${exam.passPercentage}%`],
    ['Total', `${totals.questions} questions, ${totals.marks} marks`],
  ] as const;

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-bold">Review</h2>
          <Badge tone={exam.status === 'published' ? 'success' : 'neutral'}>
            {exam.status === 'published' ? 'Will be published' : 'Will be saved as draft'}
          </Badge>
        </div>
        <dl className="divide-y divide-line">
          {facts.map(([label, value]) => (
            <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[12rem_1fr]">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-sm">
          <caption className="border-b border-line px-4 py-3 text-left font-bold">
            Exam Pattern
          </caption>
          <thead className="bg-table-head">
            <tr>
              {[
                'Part',
                'Section',
                'Question Type',
                'Questions',
                'Marks Each',
                'Negative',
                'Marks',
              ].map((header) => (
                <th key={header} scope="col" className="px-4 py-3 text-left font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {exam.sections.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted">
                  No sections yet.
                </td>
              </tr>
            )}
            {exam.sections.flatMap((section) =>
              section.groups.map((group, groupIndex) => (
                <tr key={group.id}>
                  {/* The part spans all of its question types. */}
                  {groupIndex === 0 && (
                    <>
                      <th
                        scope="row"
                        rowSpan={section.groups.length}
                        className="px-4 py-3 text-left align-top font-semibold"
                      >
                        {section.name}
                      </th>
                      <td rowSpan={section.groups.length} className="px-4 py-3 align-top">
                        {section.title || '–'}
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3">{sectionTypes[group.type].label}</td>
                  <td className="px-4 py-3">{group.questionCount}</td>
                  <td className="px-4 py-3">{group.marksPerQuestion}</td>
                  <td className="px-4 py-3">
                    {isObjective(group.type) && group.negativeMarks > 0
                      ? `−${group.negativeMarks}`
                      : '–'}
                  </td>
                  <td className="px-4 py-3 font-semibold">{groupMarks(group)}</td>
                </tr>
              )),
            )}
          </tbody>
          {exam.sections.length > 0 && (
            <tfoot className="border-t border-line bg-table-head font-bold">
              <tr>
                <td colSpan={3} className="px-4 py-3">
                  Total
                </td>
                <td className="px-4 py-3">{totals.questions}</td>
                <td colSpan={2} />
                <td className="px-4 py-3">{totals.marks}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
