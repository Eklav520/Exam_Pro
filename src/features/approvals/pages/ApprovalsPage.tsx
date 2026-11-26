import { ArrowLeft, Check } from 'lucide-react';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { paperApproved, paperReturned, selectPapers } from '@/features/question-papers';
import { Button, ConfirmDialog, EmptyState, Field, PageHeader, useToast } from '@/shared/ui';
import { PaperSetList } from '../components/PaperSetList';
import { PaperSummary } from '../components/PaperSummary';

type Decision = 'approve' | 'return';

export function ApprovalsPage() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  // Sets that were never submitted are the setter's own drafts.
  const papers = useAppSelector(selectPapers).filter((paper) => paper.submittedOn !== null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [remarks, setRemarks] = useState('');
  const [showRemarksError, setShowRemarksError] = useState(false);

  // Open on the first set that needs a decision.
  const paper =
    papers.find((item) => item.id === selectedId) ??
    papers.find((item) => item.status === 'under_review') ??
    papers[0];

  const closeDialog = () => {
    setDecision(null);
    setRemarks('');
    setShowRemarksError(false);
  };

  const handleApprove = () => {
    if (!paper) return;
    setSelectedId(paper.id);
    dispatch(paperApproved(paper.id));
    toast(`${paper.name} is approved and released.`);
    closeDialog();
  };

  const handleReturn = () => {
    if (!paper) return;
    if (!remarks.trim()) {
      setShowRemarksError(true);
      return;
    }
    setSelectedId(paper.id);
    dispatch(paperReturned({ id: paper.id, remarks: remarks.trim() }));
    toast(`${paper.name} is returned for modification.`);
    closeDialog();
  };

  return (
    <>
      <PageHeader
        title="Question Paper Approval"
        description="Review the prepared paper sets and approve the set to be released for the examination."
      />
      {!paper && <EmptyState title="No paper sets are waiting for approval" />}
      {paper && (
        <>
          <div className="grid items-start gap-5 lg:grid-cols-[20rem_1fr]">
            <PaperSetList sets={papers} selectedId={paper.id} onSelect={setSelectedId} />
            <PaperSummary paper={paper} />
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
            {paper.status !== 'under_review' && (
              <p className="text-sm text-muted">
                Only sets under review can be approved or returned.
              </p>
            )}
            <Button
              variant="outline"
              disabled={paper.status !== 'under_review'}
              onClick={() => setDecision('return')}
            >
              <ArrowLeft aria-hidden className="size-4" />
              Return for Modification
            </Button>
            <Button
              disabled={paper.status !== 'under_review'}
              onClick={() => setDecision('approve')}
            >
              <Check aria-hidden className="size-4" />
              Approve &amp; Release
            </Button>
          </div>
          <ConfirmDialog
            open={decision === 'approve'}
            title={`Approve and release ${paper.name}?`}
            confirmLabel="Approve & Release"
            onConfirm={handleApprove}
            onCancel={closeDialog}
          >
            {paper.title} will be released for {paper.exam}.
          </ConfirmDialog>
          <ConfirmDialog
            open={decision === 'return'}
            title={`Return ${paper.name} for modification?`}
            confirmLabel="Return"
            onConfirm={handleReturn}
            onCancel={closeDialog}
          >
            <Field
              label="What needs to change"
              required
              error={showRemarksError && !remarks.trim() ? 'Say what needs to change' : undefined}
            >
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
      )}
    </>
  );
}
