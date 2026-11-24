import clsx from 'clsx';
import { CircleCheck, FileText, Hourglass, Search } from 'lucide-react';
import { useState } from 'react';
import { SAMPLE_EXAM, sampleExams } from '@/features/question-papers';
import {
  Button,
  Card,
  DataTable,
  FilterBar,
  PageHeader,
  ProgressBar,
  SelectField,
  StatCard,
  Tabs,
  usePreviewAction,
  type Column,
} from '@/shared/ui';
import { evaluators, submissionStats, type EvaluatorLoad } from '../data/sample';

const tabs = [
  { id: 'allocation', label: 'Allocation' },
  { id: 'summary', label: 'Allocation Summary' },
] as const;

const percent = (part: number, whole: number) =>
  whole === 0 ? 0 : Math.round((part / whole) * 100);

const columns: Column<EvaluatorLoad>[] = [
  {
    header: 'Evaluator',
    cell: (evaluator) => (
      <span className="flex items-center gap-3 font-medium">
        <span
          aria-hidden
          className={clsx(
            'flex size-8 items-center justify-center rounded-full text-xs font-bold',
            evaluator.avatarClass,
          )}
        >
          {evaluator.initials}
        </span>
        {evaluator.name}
      </span>
    ),
  },
  { header: 'Allocated Papers', align: 'center', cell: (evaluator) => evaluator.allocated },
  { header: 'Completed', align: 'center', cell: (evaluator) => evaluator.completed },
  {
    header: 'Pending',
    align: 'center',
    cell: (evaluator) => evaluator.allocated - evaluator.completed,
  },
  {
    header: 'Progress',
    cell: (evaluator) => (
      <ProgressBar
        label={`${evaluator.name} progress`}
        percent={percent(evaluator.completed, evaluator.allocated)}
      />
    ),
  },
];

export function AllocationPage() {
  const preview = usePreviewAction();
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('allocation');
  const [exam, setExam] = useState(SAMPLE_EXAM);
  const [section, setSection] = useState('All Sections');
  const [status, setStatus] = useState('Not Allocated');
  const [evaluatorId, setEvaluatorId] = useState(evaluators[0]?.id ?? '');
  const [count, setCount] = useState('100');

  const { total, allocated } = submissionStats;
  const pending = total - allocated;

  return (
    <>
      <PageHeader
        title="Allocate Answer Papers"
        description="Assign submitted answer papers to evaluators for correction."
      />
      <FilterBar label="Filter answer papers" onSubmit={() => preview('Search')}>
        <SelectField
          label="Examination"
          value={exam}
          options={sampleExams}
          onChange={setExam}
          className="flex-1 sm:min-w-56"
        />
        <SelectField
          label="Section"
          value={section}
          options={['All Sections', 'Section A – MCQ', 'Section B – Practical']}
          onChange={setSection}
          className="flex-1"
        />
        <SelectField
          label="Status"
          value={status}
          options={['Not Allocated', 'Allocated', 'All']}
          onChange={setStatus}
          className="flex-1"
        />
        <Button type="submit">
          <Search aria-hidden className="size-4" />
          Search
        </Button>
      </FilterBar>
      <dl className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard icon={FileText} tone="blue" value={total} label="Total Submissions" />
        <StatCard icon={CircleCheck} tone="teal" value={allocated} label="Allocated" />
        <StatCard icon={Hourglass} tone="amber" value={pending} label="Pending Allocation" />
      </dl>
      <Tabs label="Allocation views" tabs={tabs} active={tab} onChange={setTab}>
        {tab === 'allocation' ? (
          <>
            <form
              className="mb-4 flex flex-wrap items-end gap-4 rounded-xl border border-line p-4"
              onSubmit={(event) => {
                event.preventDefault();
                preview('Allocate Papers');
              }}
            >
              <SelectField
                label="Allocate To"
                value={evaluatorId}
                options={evaluators.map(({ id, name }) => ({ value: id, label: name }))}
                onChange={setEvaluatorId}
                className="flex-1"
              />
              <SelectField
                label="No. of Papers"
                value={count}
                options={['50', '100', '150', '200']}
                onChange={setCount}
                className="flex-1"
              />
              <Button type="submit">Allocate Papers</Button>
            </form>
            <DataTable
              caption="Evaluators"
              columns={columns}
              rows={evaluators}
              getRowKey={(evaluator) => evaluator.id}
            />
          </>
        ) : (
          <Card className="space-y-4">
            <div>
              <p className="mb-1 text-sm font-medium">Papers allocated</p>
              <ProgressBar label="Papers allocated" percent={percent(allocated, total)} />
            </div>
            <div>
              <p className="mb-1 text-sm font-medium">Papers pending allocation</p>
              <ProgressBar label="Papers pending allocation" percent={percent(pending, total)} />
            </div>
          </Card>
        )}
      </Tabs>
    </>
  );
}
