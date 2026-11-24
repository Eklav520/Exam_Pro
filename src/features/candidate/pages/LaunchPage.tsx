import {
  ArrowRight,
  CircleCheck,
  GraduationCap,
  House,
  Laptop,
  LockKeyhole,
  Shield,
} from 'lucide-react';
import { useAppDispatch } from '@/app/hooks';
import { useLogout } from '@/features/auth';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { enterFullscreen } from '@/shared/lib/fullscreen';
import { Button } from '@/shared/ui';
import { examStarted } from '../model/candidateSlice';

const rules = [
  { text: 'Full Screen Mode Only' },
  { text: 'Shortcuts Disabled', detail: '(Alt+Tab, Ctrl+Shift+Esc, etc.)' },
  { text: 'Copy / Paste / Print Blocked' },
  { text: 'Screen & Activity Monitoring' },
  { text: 'Unauthorized Access Restricted' },
];

export function LaunchPage() {
  useDocumentTitle('Secure Exam Launch');
  const dispatch = useAppDispatch();
  const logout = useLogout();

  const handleStart = () => {
    void enterFullscreen();
    dispatch(examStarted());
  };

  return (
    <div className="flex min-h-dvh flex-col bg-linear-to-br from-navy-900 via-[#022b4c] to-[#014a67] text-white">
      <header className="flex items-center gap-4 px-6 py-6 lg:px-12">
        <GraduationCap
          aria-hidden
          className="size-14 fill-sky-400 text-sky-500"
          strokeWidth={1.25}
        />
        <p>
          <span className="block text-3xl leading-tight font-bold">ExamPro</span>
          <span className="block text-lg">Candidate Examination</span>
        </p>
        {/* Signs out: the login page sends anyone still signed in back here. */}
        <Button variant="ghost" className="ml-auto text-white! hover:bg-white/15!" onClick={logout}>
          <House aria-hidden className="size-5" />
          Home
        </Button>
      </header>
      <main className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 px-4 pb-12 lg:grid-cols-[1fr_1.2fr]">
        <div aria-hidden className="relative hidden h-96 items-center justify-center lg:flex">
          <span className="absolute size-72 rounded-full bg-sky-400/15 blur-2xl" />
          <Shield className="relative size-64 fill-blue-600/70 text-sky-300" strokeWidth={0.75} />
          <LockKeyhole className="absolute size-20 text-white" strokeWidth={1.75} />
          <Laptop className="absolute bottom-0 left-0 size-40 text-sky-200/80" strokeWidth={0.75} />
        </div>
        <section className="rounded-2xl bg-surface px-6 py-8 text-ink shadow-2xl sm:px-10">
          <LockKeyhole aria-hidden className="mx-auto size-16 text-navy-800" strokeWidth={2} />
          <h1 className="mt-3 text-center text-2xl font-bold sm:text-3xl">Secure Exam Launch</h1>
          <ul className="my-7 space-y-3.5">
            {rules.map((rule) => (
              <li key={rule.text} className="flex items-start gap-3">
                <CircleCheck aria-hidden className="size-6 shrink-0 fill-green-600 text-white" />
                <span>
                  <span className="font-semibold">{rule.text}</span> {rule.detail}
                </span>
              </li>
            ))}
          </ul>
          <Button className="w-full py-3.5! text-lg!" onClick={handleStart}>
            Start Examination
            <ArrowRight aria-hidden className="size-5" />
          </Button>
        </section>
      </main>
    </div>
  );
}
