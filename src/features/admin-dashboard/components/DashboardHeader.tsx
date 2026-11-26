import type { ReactNode } from 'react';
import { useCurrentUser } from '@/features/auth';
import { useStaffRole } from '@/features/staff';
import { Badge, PageHeader } from '@/shared/ui';

interface DashboardHeaderProps {
  description: string;
  actions?: ReactNode;
}

/** Greets the person by name and says which role this dashboard is for. */
export function DashboardHeader({ description, actions }: DashboardHeaderProps) {
  const user = useCurrentUser();
  const role = useStaffRole();
  return (
    <>
      <div className="mb-1">
        <Badge tone="brand">{role.label} Dashboard</Badge>
      </div>
      <PageHeader
        title={`Welcome, ${user?.name ?? role.label}`}
        documentTitle="Dashboard"
        description={description}
        actions={actions}
      />
    </>
  );
}
