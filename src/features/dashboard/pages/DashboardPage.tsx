import { Building2, CheckCircle2, IdCard, Info, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '@/features/auth';
import {
  useGetMyAllocationQuery,
  useGetStudentCentresQuery,
  useSaveCentrePreferencesMutation,
} from '@/features/centres/api/centresApi';
import { ExamCard, useGetExamsQuery } from '@/features/exams';
import { ResultTable, useGetResultsQuery } from '@/features/results';
import { path } from '@/shared/config/paths';
import { formatNumber } from '@/shared/lib/format';
import { Button, Card, EmptyState, PageError, PageHeader, PageLoader } from '@/shared/ui';

const PREVIEW_COUNT = 3;

export function DashboardPage() {
  const user = useCurrentUser();
  const exams = useGetExamsQuery();
  const results = useGetResultsQuery();
  const { data: allocationData } = useGetMyAllocationQuery();
  const { data: centresData } = useGetStudentCentresQuery();
  const [savePrefs, { isLoading: isSavingPrefs }] = useSaveCentrePreferencesMutation();
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [p3, setP3] = useState('');
  const [prefMsg, setPrefMsg] = useState<string | null>(null);
  const allocation = allocationData?.allocation;

  const error = exams.error ?? results.error;
  if (error) {
    const retry = () => {
      void exams.refetch();
      void results.refetch();
    };
    return <PageError error={error} onRetry={retry} />;
  }
  if (!exams.data || !results.data) return <PageLoader label="Loading dashboard…" />;

  const taken = results.data.length;
  const average = results.data.reduce((sum, result) => sum + result.percentage, 0) / taken;
  const passed = results.data.filter((result) => result.passed).length;
  const stats = [
    ['Exams available', String(exams.data.length)],
    ['Exams taken', String(taken)],
    ['Average score', taken ? `${formatNumber(average)}%` : '–'],
    ['Passed', taken ? `${passed} of ${taken}` : '–'],
  ] as const;

  // Unfinished exams are on the clock, so they come first.
  const upcoming = [...exams.data].sort(
    (a, b) => Number(b.activeAttemptId !== null) - Number(a.activeAttemptId !== null),
  );

  return (
    <>
      <PageHeader title={`Welcome, ${user?.name.split(' ')[0] ?? ''}`} />

      {centresData?.centres && centresData.centres.length > 0 && (
        <Card className="mb-8 p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-ink">
                Select Preferred Exam Districts (Priority 1, 2, 3)
              </h2>
              <p className="text-xs text-muted">
                Choose 3 districts in order of your convenience (NPTEL style). A centre &amp; seat in your preferred district will be allotted.
              </p>
            </div>
            {prefMsg && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="size-3.5" />
                {prefMsg}
              </span>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-4 sm:items-end">
            {(
              [
                ['1st Priority District', p1, setP1],
                ['2nd Priority District', p2, setP2],
                ['3rd Priority District', p3, setP3],
              ] as const
            ).map(([label, val, setter]) => (
              <div key={label}>
                <label className="mb-1 block text-xs font-medium text-ink">{label}</label>
                <select
                  className="control"
                  value={val}
                  onChange={(e) => {
                    setter(e.target.value);
                    setPrefMsg(null);
                  }}
                >
                  <option value="">Select district</option>
                  {Array.from(
                    new Set(
                      centresData.centres
                        .map((c) => c.district || c.city)
                        .filter(Boolean),
                    ),
                  ).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <Button
              type="button"
              isLoading={isSavingPrefs}
              onClick={() => {
                if (!p1 || !p2 || !p3 || new Set([p1, p2, p3]).size !== 3) {
                  setPrefMsg('Please select 3 different districts.');
                  return;
                }
                void savePrefs({ centreIds: [p1, p2, p3] })
                  .unwrap()
                  .then(() => setPrefMsg('Preferences saved!'));
              }}
            >
              Save Preferences
            </Button>
          </div>
        </Card>
      )}

      {allocation && (
        <div className="mb-8 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Candidate Profile & Hall Ticket Card */}
            <Card className="flex items-center gap-4 p-5">
              <img
                src={allocation.photoUrl || '/images/candidate-neha.jpg'}
                alt={allocation.candidateName}
                className="size-20 shrink-0 rounded-xl border border-border object-cover"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 uppercase">
                  <IdCard className="size-3.5" />
                  Hall Ticket / Admit Card
                </div>
                <p className="truncate text-lg font-bold text-ink">{allocation.candidateName}</p>
                <p className="text-sm text-muted">
                  Roll No.: <span className="font-semibold text-ink">{allocation.rollNo}</span>
                </p>
                <p className="truncate text-sm text-muted">
                  Exam:{' '}
                  <span className="font-medium text-ink">
                    {allocation.examId?.title ?? 'APPSC Computer Proficiency Test'}
                  </span>
                </p>
              </div>
            </Card>

            {/* Allocated Exam Centre & Seat Card */}
            <Card className="space-y-2 p-5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 uppercase">
                <Building2 className="size-3.5" />
                Allocated Exam Centre & Seat
              </div>
              <p className="text-lg font-bold text-ink">
                {allocation.centreId?.name ?? 'Centre A'} — Seat{' '}
                <span className="text-teal-700">{allocation.seatNumber}</span>
              </p>
              <p className="flex items-start gap-1.5 text-sm text-muted">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>
                  {allocation.centreId?.address || 'Lab Block 1, ExamPro Centre A, Hyderabad'}
                </span>
              </p>
            </Card>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
            <Info className="mt-0.5 size-4 shrink-0 text-sky-700" />
            <p>
              Your examination terminal at the allocated Exam Centre is pre-configured and
              hardware-bound. Please report to your assigned centre and seat 30 minutes before the
              exam start time with your Hall Ticket.
            </p>
          </div>
        </div>
      )}
      <dl className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <Card key={label}>
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
          </Card>
        ))}
      </dl>

      <SectionHeading title="Exams" link={path.exams} />
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {upcoming.slice(0, PREVIEW_COUNT).map((exam) => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
      </div>

      <SectionHeading title="Recent results" link={path.results} />
      {taken === 0 ? (
        <EmptyState title="No results yet">Your results appear here after an exam.</EmptyState>
      ) : (
        <ResultTable results={results.data.slice(0, PREVIEW_COUNT)} />
      )}
    </>
  );
}

function SectionHeading({ title, link }: { title: string; link: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Link to={link} className="text-sm font-medium text-brand-700 hover:underline">
        View all
      </Link>
    </div>
  );
}
