import {
  getPaperTotals,
  getPatternProgress,
  PaperStatusBadge,
  type PaperSet,
} from '@/features/question-papers';

/** What an approver needs to decide. The questions themselves stay with the setter. */
export function PaperSummary({ paper }: { paper: PaperSet }) {
  const totals = getPaperTotals(paper);
  const facts = [
    ['Examination', paper.exam],
    ['Paper Title', paper.title],
    ['Prepared By', paper.setter?.name ?? '–'],
    ...partsOf(paper),
    ['Total', `${totals.questions} Questions, ${totals.marks} Marks`],
    ['Submitted On', paper.submittedOn ?? '–'],
    ['Last Updated', paper.updatedAt],
  ];

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

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

/** One line per part: of the exam's pattern, or MCQ and Practical for older sets. */
function partsOf(paper: PaperSet): [string, string][] {
  if (paper.pattern?.length) {
    const progress = getPatternProgress(paper);
    return paper.pattern.map((section) => {
      const rows = progress.filter((row) => row.section.id === section.id);
      const written = rows.reduce((sum, row) => sum + row.questions.length, 0);
      const required = rows.reduce((sum, row) => sum + row.group.questionCount, 0);
      const marks = rows.reduce(
        (sum, row) => sum + row.questions.length * row.group.marksPerQuestion,
        0,
      );
      const label = `${section.name}${section.title ? ` – ${section.title}` : ''}`;
      return [label, `${written} of ${plural(required, 'Question')}, ${marks} Marks`];
    });
  }
  const totals = getPaperTotals(paper);
  return [
    ['Section A – MCQ', `${plural(paper.mcqs.length, 'Question')}, ${totals.mcqMarks} Marks`],
    ['Section B – Practical', `${plural(paper.tasks.length, 'Task')}, ${totals.taskMarks} Marks`],
  ];
}
