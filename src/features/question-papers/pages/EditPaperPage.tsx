import { Link, useParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { path } from '@/shared/config/paths';
import { buttonClass, EmptyState, PageHeader } from '@/shared/ui';
import { PaperWizard } from '../components/wizard/PaperWizard';
import { selectPapers } from '../model/papersSlice';

export function EditPaperPage() {
  const { paperId } = useParams();
  const paper = useAppSelector(selectPapers).find((item) => item.id === paperId);

  if (paper?.status === 'draft') return <PaperWizard key={paper.id} initial={paper} />;
  return (
    <>
      <PageHeader title="Edit Question Paper" />
      <EmptyState title={paper ? `${paper.name} cannot be edited` : 'This paper set was not found'}>
        {paper && <p className="mb-4">Only drafts can be edited. You can duplicate it instead.</p>}
        <Link to={path.adminQuestionPapers} className={buttonClass('secondary')}>
          Back to question papers
        </Link>
      </EmptyState>
    </>
  );
}
