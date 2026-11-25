import {
  ArrowRight,
  Building2,
  Check,
  CircleCheck,
  FileText,
  GraduationCap,
  Hash,
  IdCard,
  LockKeyhole,
  Minus,
  Monitor,
  Play,
  ShieldCheck,
  ShieldHalf,
  User,
  X,
} from 'lucide-react';
import { useAppDispatch } from '@/app/hooks';
import { useLogout } from '@/features/auth';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { enterFullscreen } from '@/shared/lib/fullscreen';
import { examStarted } from '../model/candidateSlice';

const seatDetails: readonly {
  icon: typeof IdCard;
  label: string;
  value: string;
  highlight?: boolean;
}[] = [
  {
    icon: IdCard,
    label: 'Hall Ticket No. (Roll No.)',
    value: 'ROLL1004',
    highlight: true,
  },
  {
    icon: User,
    label: 'Candidate Name',
    value: 'Neha Verma',
  },
  {
    icon: FileText,
    label: 'Exam Name',
    value: 'MS Office Practical Exam',
  },
  {
    icon: Building2,
    label: 'Exam Centre',
    value: 'Centre A',
  },
  {
    icon: Monitor,
    label: 'System ID',
    value: 'CEN-A-PC-04',
  },
  {
    icon: Hash,
    label: 'Seat Number',
    value: 'A-004',
  },
];

export function LaunchPage() {
  useDocumentTitle('Verify Your Examination Seat');
  const dispatch = useAppDispatch();
  const logout = useLogout();

  const handleStart = () => {
    void enterFullscreen();
    dispatch(examStarted());
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-linear-to-b from-[#071E3D] via-[#0A294E] to-[#0D345E] text-white">
      {/* Subtle glowing blue/cyan network wave backdrop */}
      <svg
        aria-hidden
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 size-full opacity-30"
      >
        <defs>
          <linearGradient id="wave-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <path
          d="M-80 260 C 260 120, 560 420, 960 220 C 1200 100, 1360 180, 1520 120"
          fill="none"
          stroke="url(#wave-glow)"
          strokeWidth="1.5"
        />
        <path
          d="M-80 340 C 320 200, 620 480, 1020 290 C 1240 190, 1380 250, 1520 210"
          fill="none"
          stroke="url(#wave-glow)"
          strokeWidth="1"
        />
        <path
          d="M-80 680 C 280 560, 640 780, 1060 600 C 1260 520, 1380 570, 1520 530"
          fill="none"
          stroke="url(#wave-glow)"
          strokeWidth="1.5"
        />
      </svg>

      {/* Top Browser Bar */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/10 bg-[#061830]/60 px-5 py-3 backdrop-blur-sm lg:px-8">
        <div className="flex items-center gap-3">
          <div className="relative flex size-9 items-center justify-center rounded-lg bg-cyan-500/15 ring-1 ring-cyan-400/30">
            <GraduationCap aria-hidden className="size-5 text-cyan-300" />
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-lg font-bold tracking-tight text-white">ExamPro</span>
            <span className="hidden text-xs font-medium text-slate-300 sm:inline">
              Secure Exam Browser
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-[#22C55E] bg-[#22C55E]/15 px-3.5 py-1 text-xs font-semibold text-emerald-300">
            <Monitor aria-hidden className="size-3.5 text-emerald-400" />
            <span>Authorized System</span>
            <Check aria-hidden className="size-3.5 text-emerald-400" strokeWidth={2.5} />
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            <button
              type="button"
              aria-label="Minimize"
              className="rounded p-1.5 transition hover:bg-white/10 hover:text-white"
            >
              <Minus aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Exit to login"
              onClick={logout}
              className="rounded p-1.5 transition hover:bg-rose-500/20 hover:text-rose-200"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Center Verification Card */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-6">
        <section className="mx-auto my-2 w-full max-w-[560px] rounded-2xl bg-white px-6 py-6 text-slate-900 shadow-2xl sm:px-8 sm:py-7">
          {/* Card Brand Header */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-teal-500 text-white shadow-xs">
                <GraduationCap aria-hidden className="size-5" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight">
                <span className="text-[#0F172A]">Exam</span>
                <span className="text-[#0D9488]">Pro</span>
              </span>
            </div>
            <p className="mt-0.5 text-xs font-semibold tracking-wide text-slate-600">
              Secure Examination
            </p>
          </div>

          {/* Candidate Passport Photo Frame */}
          <div className="mt-4 flex justify-center">
            <div className="relative size-28 rounded-2xl border-2 border-sky-200 bg-sky-50 p-1.5 shadow-sm">
              {/* Biometric corner viewfinder brackets */}
              <span
                aria-hidden
                className="absolute top-1 left-1 size-3 rounded-tl-md border-t-2 border-l-2 border-sky-500"
              />
              <span
                aria-hidden
                className="absolute top-1 right-1 size-3 rounded-tr-md border-t-2 border-r-2 border-sky-500"
              />
              <span
                aria-hidden
                className="absolute bottom-1 left-1 size-3 rounded-bl-md border-b-2 border-l-2 border-sky-500"
              />
              <span
                aria-hidden
                className="absolute right-1 bottom-1 size-3 rounded-br-md border-r-2 border-b-2 border-sky-500"
              />

              <img
                src="/images/candidate-neha.jpg"
                alt="Candidate Neha Verma"
                className="size-full rounded-xl object-cover"
              />

              {/* Overlapping green shield with white checkmark */}
              <div
                aria-hidden
                className="absolute -right-2 -bottom-2 flex size-8 items-center justify-center rounded-full bg-white shadow-md"
              >
                <div className="flex size-6.5 items-center justify-center rounded-full bg-[#16A34A] text-white">
                  <ShieldCheck className="size-4" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>

          {/* Title & Instruction Text */}
          <div className="mt-4 text-center">
            <h1 className="text-[26px] leading-tight font-bold tracking-tight text-[#0F172A]">
              Verify Your Examination Seat
            </h1>
            <p className="mt-1 text-sm text-[#475569]">
              Please confirm the below details with your Hall Ticket before starting the exam.
            </p>
          </div>

          {/* Candidate & Seat Details Table */}
          <div className="mt-4 divide-y divide-slate-200/80 rounded-xl border border-slate-200 bg-slate-50/90 text-sm">
            {seatDetails.map(({ icon: Icon, label, value, highlight }) => (
              <div
                key={label}
                className="grid grid-cols-[auto_1fr_auto_1.15fr] items-center gap-x-2.5 px-4 py-2.5"
              >
                <Icon aria-hidden className="size-4 text-slate-500" />
                <span className="font-medium text-slate-600">{label}</span>
                <span className="font-semibold text-slate-400">:</span>
                {highlight ? (
                  <span className="w-full rounded-md bg-blue-100/80 px-3 py-1 font-bold text-slate-900">
                    {value}
                  </span>
                ) : (
                  <span className="font-bold text-slate-900">{value}</span>
                )}
              </div>
            ))}
          </div>

          {/* Seat Verified Banner */}
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200/60 bg-emerald-50 px-4 py-2.5">
            <CircleCheck aria-hidden className="size-5 shrink-0 fill-[#16A34A] text-white" />
            <p className="text-sm font-bold text-emerald-950">
              Your seat is verified for this examination.
            </p>
          </div>

          {/* Primary CTA Button */}
          <button
            type="button"
            onClick={handleStart}
            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-[#00796B] py-3.5 text-lg font-semibold text-white shadow-md transition hover:bg-[#00695C] focus-visible:ring-2 focus-visible:ring-[#00796B] focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-white text-[#00796B]">
              <Play aria-hidden className="ml-0.5 size-3.5 fill-current" />
            </span>
            <span>Start Your Exam</span>
            <ArrowRight aria-hidden className="size-5" />
          </button>
        </section>
      </main>

      {/* Bottom 3-Column Security Status Bar */}
      <footer className="relative z-10 border-t border-white/15 bg-[#061830]/90 backdrop-blur-sm">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-white/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex items-center justify-center gap-2.5 px-4 py-3 text-sm">
            <LockKeyhole aria-hidden className="size-4 text-teal-400" />
            <span className="font-bold text-white">Secure Mode</span>
            <span className="text-slate-300">(Restricted Access)</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 px-4 py-3 text-sm">
            <Monitor aria-hidden className="size-4 text-cyan-400" />
            <span className="font-bold text-white">Registered System</span>
            <span className="text-slate-300">(CEN-A-PC-04)</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 px-4 py-3 text-sm">
            <ShieldHalf aria-hidden className="size-4 text-cyan-400" />
            <span className="font-bold text-white">Monitoring Active</span>
            <span className="text-slate-300">(Anti-Malpractice)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
