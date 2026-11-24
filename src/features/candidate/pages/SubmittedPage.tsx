import { Check, SquareCheckBig, Timer, UserRound, type LucideIcon } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { useLogout } from '@/features/auth';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { exitFullscreen } from '@/shared/lib/fullscreen';
import { formatDateTime } from '@/shared/lib/format';
import { Button } from '@/shared/ui';
import { candidate, TOTAL_MARKS } from '../data/sample';
import { selectCandidate } from '../model/candidateSlice';

export function SubmittedPage() {
  useDocumentTitle('Exam submitted');
  const { submittedAt } = useAppSelector(selectCandidate);
  const logout = useLogout();

  const facts: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: UserRound, label: 'Roll No.', value: candidate.rollNo },
    { icon: Timer, label: 'Total Marks', value: String(TOTAL_MARKS) },
    {
      icon: SquareCheckBig,
      label: 'Submitted At',
      value: submittedAt ? formatDateTime(submittedAt) : '–',
    },
  ];

  return (
    <main className="flex min-h-dvh items-center justify-center bg-canvas p-4">
      <section className="w-full max-w-2xl rounded-2xl border border-green-200 bg-[#ebfdef] px-5 py-10 text-center sm:px-8">
        <div aria-hidden className="relative mx-auto w-fit">
          <span className="absolute top-3 -left-10 h-1.5 w-6 rotate-45 rounded-full bg-amber-400" />
          <span className="absolute top-12 -left-14 h-1.5 w-7 rotate-12 rounded-full bg-orange-500" />
          <span className="absolute top-3 -right-10 h-1.5 w-6 -rotate-45 rounded-full bg-emerald-600" />
          <span className="absolute top-12 -right-14 h-1.5 w-7 -rotate-12 rounded-full bg-blue-500" />
          <span className="flex size-20 items-center justify-center rounded-full bg-green-600 text-white">
            <Check className="size-11" strokeWidth={3} />
          </span>
        </div>
        <h1 className="mt-5 text-2xl font-bold sm:text-3xl">Exam Submitted Successfully!</h1>
        <p className="mt-2">Your responses and practical files have been securely submitted.</p>
        <dl className="my-7 grid gap-y-4 rounded-xl border border-line bg-surface px-2 py-4 text-left sm:grid-cols-3 sm:divide-x sm:divide-line">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-4">
              <Icon aria-hidden className="size-7 shrink-0 text-navy-800" strokeWidth={1.75} />
              <div>
                <dt className="text-sm">{label}</dt>
                <dd className="font-bold">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
        <Button
          className="w-full max-w-xs bg-[#014a67]! py-3! hover:bg-navy-800!"
          onClick={() => {
            void exitFullscreen();
            logout();
          }}
        >
          Close
        </Button>
      </section>
    </main>
  );
}
