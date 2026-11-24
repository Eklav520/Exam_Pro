import { EmptyState, PageHeader } from '@/shared/ui';

export function ComingSoonPage({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState title="This screen is not designed yet" />
    </>
  );
}
