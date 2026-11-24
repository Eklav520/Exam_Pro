import { Check, CircleCheck, Eye, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { SAMPLE_EXAM, sampleExams } from '@/features/question-papers';
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  IconButton,
  PageHeader,
  SelectField,
  StatCard,
  Tabs,
  usePreviewAction,
  type Column,
} from '@/shared/ui';
import { EvaluationNav } from '../components/EvaluationNav';
import { CandidateReview } from '../components/CandidateReview';
import {
  candidateResults,
  resultStats,
  type CandidateResult,
  type ResultStatus,
} from '../data/sample';

const tabs = [
  { id: 'summary', label: 'Result Summary' },
  { id: 'candidates', label: 'Candidate-wise Review' },
] as const;

const statuses: Record<ResultStatus, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  finalized: { label: 'Finalized', tone: 'success' },
  under_review: { label: 'Under Review', tone: 'warning' },
  re_evaluation: { label: 'Re-evaluation', tone: 'danger' },
};

export function FinalApprovalPage() {
  const preview = usePreviewAction();
  const [exam, setExam] = useState(SAMPLE_EXAM);
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('summary');
  const [selectedId, setSelectedId] = useState(candidateResults[0]?.registrationNo ?? '');
  const [isConfirming, setIsConfirming] = useState(false);

  const rows = exam === SAMPLE_EXAM ? candidateResults : [];
  const selected = rows.find((row) => row.registrationNo === selectedId);

  const columns: Column<CandidateResult>[] = [
    { header: '#', cell: (_row, index) => index + 1 },
    { header: 'Registration No.', cell: (row) => row.registrationNo },
    { header: 'Candidate Name', cell: (row) => row.name },
    { header: 'Total Marks', align: 'center', cell: (row) => row.totalMarks },
    { header: 'Evaluator Marks', align: 'center', cell: (row) => row.evaluatorMarks },
    {
      header: 'Final Marks',
      align: 'center',
      cell: (row) => <span className="font-semibold">{row.finalMarks}</span>,
    },
    {
      header: 'Status',
      align: 'center',
      cell: ({ status }) => <Badge tone={statuses[status].tone}>{statuses[status].label}</Badge>,
    },
    {
      header: 'Actions',
      align: 'center',
      cell: (row) => (
        <IconButton
          icon={Eye}
          label={`Review ${row.name}`}
          onClick={() => {
            setSelectedId(row.registrationNo);
            setTab('candidates');
          }}
        />
      ),
    },
  ];

  return (
    <>
      <EvaluationNav />
      <PageHeader
        title="Result Review & Final Approval"
        description="Review evaluator marks, make necessary changes and approve final results."
      />
      <div className="mb-5 grid items-stretch gap-4 lg:grid-cols-[1.4fr_3fr]">
        <div className="rounded-xl border border-line p-4">
          <SelectField label="Examination" value={exam} options={sampleExams} onChange={setExam} />
        </div>
        <dl className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={CircleCheck}
            tone="green"
            value={resultStats.evaluated}
            label="Evaluated"
          />
          <StatCard icon={Eye} tone="sky" value={resultStats.underReview} label="Under Review" />
          <StatCard
            icon={RefreshCw}
            tone="amber"
            value={resultStats.reEvaluation}
            label="Re-evaluation"
          />
        </dl>
      </div>
      <Tabs label="Result views" tabs={tabs} active={tab} onChange={setTab}>
        {tab === 'candidates' && selected ? (
          <CandidateReview candidates={rows} selected={selected} onSelect={setSelectedId} />
        ) : (
          <DataTable
            caption="Results"
            columns={columns}
            rows={rows}
            getRowKey={(row) => row.registrationNo}
            emptyMessage="No results for this examination yet."
          />
        )}
      </Tabs>
      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <Button
          variant="outline"
          disabled={rows.length === 0}
          onClick={() => preview('Send for Re-evaluation')}
        >
          Send for Re-evaluation
        </Button>
        <Button disabled={rows.length === 0} onClick={() => setIsConfirming(true)}>
          <Check aria-hidden className="size-4" />
          Approve Final Results
        </Button>
      </div>
      <ConfirmDialog
        open={isConfirming}
        title="Approve final results?"
        confirmLabel="Approve"
        onConfirm={() => {
          setIsConfirming(false);
          preview('Approve Final Results');
        }}
        onCancel={() => setIsConfirming(false)}
      >
        Results for {exam} will be final.
      </ConfirmDialog>
    </>
  );
}
