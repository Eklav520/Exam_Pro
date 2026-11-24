import { Download } from 'lucide-react';
import { getPaperTotals, PaperSections, type PaperSet } from '@/features/question-papers';
import { Badge, Button, usePreviewAction } from '@/shared/ui';

export function PaperPreview({ paper }: { paper: PaperSet }) {
  const preview = usePreviewAction();
  const totals = getPaperTotals(paper);

  return (
    <section className="min-w-0 rounded-xl border border-line p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="mb-2 font-bold">Paper Set Preview – {paper.name}</h2>
          <div className="flex flex-wrap gap-2">
            <Badge tone="info">{paper.exam}</Badge>
            <Badge tone="violet">
              Total: {totals.questions} Questions | {totals.marks} Marks
            </Badge>
          </div>
        </div>
        <Button size="sm" onClick={() => preview(`Download ${paper.name}`)}>
          <Download aria-hidden className="size-4" />
          Download
        </Button>
      </div>
      <PaperSections paper={paper} />
    </section>
  );
}
