import { ArrowRight, CircleUserRound, ClipboardList, Headset, Info, Monitor } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { path, to } from '@/shared/config/paths';
import { Button, buttonClass, ConfirmDialog, IconButton, usePreviewAction } from '@/shared/ui';
import { AppIcon } from '../components/AppIcon';
import { CandidateTimer } from '../components/CandidateTimer';
import { ExamHeader } from '../components/ExamHeader';
import { HeaderBadge } from '../components/HeaderBadge';
import { QuestionNavigator } from '../components/QuestionNavigator';
import { candidate, sectionA, sectionB, taskIds, tasks } from '../data/sample';
import { examSubmitted, selectCandidate } from '../model/candidateSlice';

const facts = [
  ['Roll No.', candidate.rollNo],
  ['Exam', candidate.exam],
  ['Centre', candidate.centre],
] as const;

export function SectionsPage() {
  const preview = usePreviewAction();
  const dispatch = useAppDispatch();
  const { answers, tasks: taskStatus } = useAppSelector(selectCandidate);
  const [isConfirming, setIsConfirming] = useState(false);

  const unanswered = sectionA.questionCount - Object.keys(answers).length;
  const unfinished = taskIds.filter((id) => taskStatus[id] !== 'completed').length;
  // Continue where the candidate left off.
  const nextTask = taskIds.find((id) => taskStatus[id] !== 'completed') ?? 'word';

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <ExamHeader title="Online Examination">
        <HeaderBadge>Secure Mode</HeaderBadge>
        <IconButton
          inverse
          icon={Monitor}
          label="Screen status"
          onClick={() => preview('Screen status')}
        />
        <IconButton inverse icon={Headset} label="Help" onClick={() => preview('Help')} />
      </ExamHeader>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 py-5 lg:px-6 2xl:max-w-400">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="flex items-center gap-8 rounded-xl border border-line bg-canvas px-6 py-4">
            <CircleUserRound aria-hidden className="size-18 text-avatar" strokeWidth={1.25} />
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
              {facts.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt>{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <CandidateTimer variant="card" />
        </div>

        <div className="grid flex-1 gap-5 md:grid-cols-[16rem_1fr]">
          <QuestionNavigator />
          <section className="flex flex-col">
            <h2 className="mb-4 text-2xl font-bold">Examination</h2>
            <div className="grid flex-1 gap-5 lg:grid-cols-2">
              <article className="flex flex-col items-center justify-center rounded-xl border border-blue-200 bg-[#e9f2fe] px-5 py-7 text-center">
                <ClipboardList aria-hidden className="size-16 text-avatar" strokeWidth={1.5} />
                <h3 className="mt-3 text-xl font-bold">{sectionA.title}</h3>
                <p className="mt-1 mb-6">
                  {sectionA.questionCount} Questions | {sectionA.marks} Marks
                </p>
                <Link
                  to={path.candidateMcq}
                  aria-label="Start or continue Section A"
                  className={`${buttonClass('primary')} w-full max-w-64 bg-avatar! py-3! hover:bg-navy-800!`}
                >
                  Start / Continue
                  <ArrowRight aria-hidden className="size-5" />
                </Link>
              </article>
              <article className="flex flex-col items-center justify-center rounded-xl border border-green-200 bg-[#eefcf0] px-5 py-7 text-center">
                <span className="flex h-16 items-center gap-4">
                  {taskIds.map((id) => (
                    <AppIcon key={id} task={id} large />
                  ))}
                </span>
                <h3 className="mt-3 text-xl font-bold">{sectionB.title}</h3>
                <p className="mt-1 mb-6">
                  {taskIds.length} Tasks ({taskIds.map((id) => tasks[id].shortApp).join(', ')}) |{' '}
                  {sectionB.marks} Marks
                </p>
                <Link
                  to={to.candidateTask(nextTask)}
                  aria-label="Start or continue Section B"
                  className={`${buttonClass('primary')} w-full max-w-64 py-3!`}
                >
                  Start / Continue
                  <ArrowRight aria-hidden className="size-5" />
                </Link>
              </article>
            </div>
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-info-soft/50 px-5 py-3">
          <p className="flex items-center gap-3">
            <Info aria-hidden className="size-6 shrink-0 text-info" />
            You can switch between Section A and Section B at any time. Your progress will be
            auto-saved.
          </p>
          <Button onClick={() => setIsConfirming(true)}>Submit Examination</Button>
        </div>
      </main>
      <ConfirmDialog
        open={isConfirming}
        title="Submit your examination?"
        confirmLabel="Submit"
        onCancel={() => setIsConfirming(false)}
        onConfirm={() => dispatch(examSubmitted())}
      >
        <p>
          {unanswered === 0
            ? 'All questions are answered.'
            : `${unanswered} of ${sectionA.questionCount} questions are not answered.`}{' '}
          {unfinished === 0
            ? 'All tasks are completed.'
            : `${unfinished} of ${taskIds.length} tasks are not marked as completed.`}
        </p>
        <p className="mt-2">You cannot change your answers after submitting.</p>
      </ConfirmDialog>
    </div>
  );
}
