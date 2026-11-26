import { useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { useCurrentUser } from '@/features/auth';
import { PaperWizard } from '../components/wizard/PaperWizard';
import { SAMPLE_EXAM } from '../data/sample';
import { createPaper, getNextSetName } from '../model/paper';
import { selectPapers } from '../model/papersSlice';

export function CreatePaperPage() {
  const papers = useAppSelector(selectPapers);
  const user = useCurrentUser();
  const [initial] = useState(() =>
    createPaper(
      SAMPLE_EXAM,
      getNextSetName(papers, SAMPLE_EXAM),
      user && { id: user.id, name: user.name },
    ),
  );
  return <PaperWizard initial={initial} />;
}
