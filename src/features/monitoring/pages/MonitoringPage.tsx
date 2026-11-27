import { PageHeader } from '@/shared/ui';
import { CandidatesView } from '../components/CandidatesView';

export function MonitoringPage() {
  return (
    <>
      <PageHeader
        title="System Mapping"
        description="Seat registered candidates at a centre and computer, following their centre preferences."
      />
      <CandidatesView />
    </>
  );
}
