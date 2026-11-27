import { PageHeader } from '@/shared/ui';
import { CandidatesView } from '../components/CandidatesView';

export function MonitoringPage() {
  return (
    <>
      <PageHeader
        title="System Mapping"
        description="Map registered candidates to a centre and computer by their centre preferences, then follow their seats live."
      />
      <CandidatesView />
    </>
  );
}
