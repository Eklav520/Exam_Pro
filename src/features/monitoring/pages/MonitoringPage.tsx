import { useState } from 'react';
import { PageHeader, Tabs } from '@/shared/ui';
import { CandidatesView } from '../components/CandidatesView';
import { SystemsView } from '../components/SystemsView';

const tabs = [
  { id: 'candidates', label: 'Student Mapping' },
  { id: 'systems', label: 'Centre Systems' },
] as const;

export function MonitoringPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('candidates');

  return (
    <>
      <PageHeader
        title="System Mapping"
        description="Map registered candidates to a centre and computer by their centre preferences, then follow their seats and every centre's computers live."
      />
      <Tabs label="Monitoring views" tabs={tabs} active={tab} onChange={setTab}>
        {tab === 'systems' ? <SystemsView /> : <CandidatesView />}
      </Tabs>
    </>
  );
}
