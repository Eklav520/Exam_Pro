import { Badge } from '@/shared/ui';
import type { PaperStatus } from '../data/sample';

const config = {
  draft: { label: 'Draft', tone: 'neutral' },
  under_review: { label: 'Under Review', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
} as const;

export function PaperStatusBadge({ status }: { status: PaperStatus }) {
  return <Badge tone={config[status].tone}>{config[status].label}</Badge>;
}
