import { useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { PaperWizard } from '../components/wizard/PaperWizard';
import { SAMPLE_EXAM } from '../data/sample';
import { createPaper, getNextSetName } from '../model/paper';
import { selectPapers } from '../model/papersSlice';

export function CreatePaperPage() {
  const papers = useAppSelector(selectPapers);
  const [initial] = useState(() => createPaper(SAMPLE_EXAM, getNextSetName(papers, SAMPLE_EXAM)));
  return <PaperWizard initial={initial} />;
}
