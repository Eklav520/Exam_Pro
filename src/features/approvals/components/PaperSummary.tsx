import { getPaperTotals, PaperStatusBadge, type PaperSet } from '@/features/question-papers';

/** What an approver needs to decide. The questions themselves stay with the setter. */
export function PaperSummary({ paper }: { paper: PaperSet }) {
  const totals = getPaperTotals(paper);
  const facts = [
    ['Examination', paper.exam],
    ['Paper Title', paper.title],
    ['Prepared By', paper.setter?.name ?? '–'],
    [
      'Section A – MCQ',
      `${paper.mcqs.length} ${paper.mcqs.length === 1 ? 'Question' : 'Questions'}, ${totals.mcqMarks} Marks`,
    ],
    [
      'Section B – Practical',
      `${paper.tasks.length} ${paper.tasks.length === 1 ? 'Task' : 'Tasks'}, ${totals.taskMarks} Marks`,
    ],
    ['Total', `${totals.questions} Questions, ${totals.marks} Marks`],
    ['Submitted On', paper.submittedOn ?? '–'],
    ['Last Updated', paper.updatedAt],
  ] as const;

  return (
    <section className="min-w-0 rounded-xl border border-line p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold">Paper Set Details – {paper.name}</h2>
        <PaperStatusBadge status={paper.status} />
      </div>
      <dl className="divide-y divide-line">
        {facts.map(([label, value]) => (
          <div key={label} className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr]">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      {paper.remarks && (
        <p className="mt-3 rounded-lg bg-warning-soft px-4 py-3 text-sm">
          <span className="font-semibold">Earlier remarks: </span>
          {paper.remarks}
        </p>
      )}
    </section>
  );
}
