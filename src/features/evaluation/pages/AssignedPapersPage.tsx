import { CircleCheck, ClipboardList, Hourglass, Send } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { path } from '@/shared/config/paths';
import {
  Badge,
  Button,
  buttonClass,
  ConfirmDialog,
  DataTable,
  PageHeader,
  StatCard,
  useToast,
  type Column,
} from '@/shared/ui';
import type { AssignedScript, ScriptStatus } from '../data/assigned';
import { countScripts, evaluatedScriptsSent, selectAssignedScripts } from '../model/assignedSlice';

const statuses: Record<ScriptStatus, { label: string; tone: 'warning' | 'info' | 'success' }> = {
  pending: { label: 'Pending', tone: 'warning' },
  evaluated: { label: 'Evaluated', tone: 'info' },
  sent: { label: 'Sent to Higher Official', tone: 'success' },
};

const columns: Column<AssignedScript>[] = [
  { header: '#', cell: (_row, index) => index + 1 },
  { header: 'Registration No.', cell: (row) => row.registrationNo },
  { header: 'Examination', cell: (row) => row.exam },
  { header: 'Paper Set', cell: (row) => row.paperSet },
  { header: 'Centre', cell: (row) => row.centre },
  { header: 'Assigned On', cell: (row) => row.assignedOn },
  {
    header: 'Marks',
    align: 'center',
    cell: (row) => (row.marks === null ? '–' : `${row.marks} / ${row.maxMarks}`),
  },
  {
    header: 'Status',
    align: 'center',
    cell: ({ status }) => <Badge tone={statuses[status].tone}>{statuses[status].label}</Badge>,
  },
  {
    header: 'Action',
    align: 'center',
    cell: (row) =>
      row.status === 'pending' ? (
        <Link
          to={path.adminWorkspace}
          aria-label={`Evaluate ${row.registrationNo}`}
          className={buttonClass('primary', 'sm')}
        >
          Evaluate
        </Link>
      ) : (
        <span className="text-muted">–</span>
      ),
  },
];

export function AssignedPapersPage() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const scripts = useAppSelector(selectAssignedScripts);
  const counts = countScripts(scripts);
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <>
      <PageHeader
        title="Assigned Answer Papers"
        description="Evaluate the answer papers allocated to you, then send the marks to the Higher Official."
        actions={
          <Button disabled={counts.evaluated === 0} onClick={() => setIsConfirming(true)}>
            <Send aria-hidden className="size-4" />
            Send to Higher Official
          </Button>
        }
      />
      <dl className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ClipboardList} tone="blue" value={counts.assigned} label="Assigned" />
        <StatCard icon={Hourglass} tone="amber" value={counts.pending} label="Pending" />
        <StatCard icon={CircleCheck} tone="sky" value={counts.evaluated} label="Evaluated" />
        <StatCard icon={Send} tone="green" value={counts.sent} label="Sent to Higher Official" />
      </dl>
      <DataTable
        caption="Assigned answer papers"
        columns={columns}
        rows={scripts}
        getRowKey={(row) => row.registrationNo}
        emptyMessage="No answer papers are assigned to you yet."
      />
      <ConfirmDialog
        open={isConfirming}
        title={`Send ${counts.evaluated} evaluated ${counts.evaluated === 1 ? 'paper' : 'papers'}?`}
        confirmLabel="Send"
        onConfirm={() => {
          dispatch(evaluatedScriptsSent());
          toast(
            `${counts.evaluated} papers are sent to the Higher Official. Not saved to a server yet.`,
          );
          setIsConfirming(false);
        }}
        onCancel={() => setIsConfirming(false)}
      >
        The Higher Official will review the marks. You cannot change them after sending.
      </ConfirmDialog>
    </>
  );
}
