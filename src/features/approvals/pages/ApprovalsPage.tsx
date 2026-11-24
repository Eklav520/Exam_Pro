import { ArrowLeft, Check } from 'lucide-react';
import { useState } from 'react';
import { paperSets } from '@/features/question-papers';
import { Button, ConfirmDialog, Field, PageHeader, usePreviewAction } from '@/shared/ui';
import { PaperPreview } from '../components/PaperPreview';
import { PaperSetList } from '../components/PaperSetList';

type Decision = 'approve' | 'return';

export function ApprovalsPage() {
  const preview = usePreviewAction();
  const [selectedId, setSelectedId] = useState('set-2');
  const [decision, setDecision] = useState<Decision | null>(null);
  const [remarks, setRemarks] = useState('');

  const paper = paperSets.find((set) => set.id === selectedId);
  if (!paper) return null;

  const canDecide = paper.status === 'under_review';

  const handleConfirm = () => {
    preview(decision === 'approve' ? 'Approve & Release' : 'Return for Modification');
    setDecision(null);
    setRemarks('');
  };

  return (
    <>
      <PageHeader
        title="Question Paper Approval"
        description="Review the prepared paper sets and approve the set to be released for the examination."
      />
      <div className="grid items-start gap-5 lg:grid-cols-[20rem_1fr]">
        <PaperSetList sets={paperSets} selectedId={selectedId} onSelect={setSelectedId} />
        <PaperPreview key={paper.id} paper={paper} />
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
        {!canDecide && (
          <p className="text-sm text-muted">Only sets under review can be approved or returned.</p>
        )}
        <Button variant="outline" disabled={!canDecide} onClick={() => setDecision('return')}>
          <ArrowLeft aria-hidden className="size-4" />
          Return for Modification
        </Button>
        <Button disabled={!canDecide} onClick={() => setDecision('approve')}>
          <Check aria-hidden className="size-4" />
          Approve &amp; Release
        </Button>
      </div>
      <ConfirmDialog
        open={decision === 'approve'}
        title={`Approve and release ${paper.name}?`}
        confirmLabel="Approve & Release"
        onConfirm={handleConfirm}
        onCancel={() => setDecision(null)}
      >
        {paper.title} will be released for {paper.exam}.
      </ConfirmDialog>
      <ConfirmDialog
        open={decision === 'return'}
        title={`Return ${paper.name} for modification?`}
        confirmLabel="Return"
        onConfirm={handleConfirm}
        onCancel={() => setDecision(null)}
      >
        <Field label="What needs to change">
          {(props) => (
            <textarea
              {...props}
              rows={3}
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
            />
          )}
        </Field>
      </ConfirmDialog>
    </>
  );
}
