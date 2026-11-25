import { Download, MonitorCheck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrentUser, useLogout } from '@/features/auth';
import { path } from '@/shared/config/paths';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { Button, Card } from '@/shared/ui';

export function StudentPortalPage() {
  useDocumentTitle('Student Portal');
  const user = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Welcome, {user?.name ?? 'Student'}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Examinations must be taken inside the ExamPro Secure Exam Browser.
          </p>
        </div>
        <Button variant="secondary" onClick={logout}>
          Log out
        </Button>
      </div>

      <Card className="space-y-4 p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <ShieldCheck className="size-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-ink">
              Download Secure Exam Browser (.exe)
            </h2>
            <p className="text-sm text-muted">
              Standard web browsers (Chrome, Edge, Firefox) cannot run proctored exams. Launch
              the Windows Secure Exam Browser on your registered lab terminal to verify your seat
              and start your exam.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button type="button" onClick={() => window.alert('ExamPro Secure Browser (.exe) installer will be downloaded from your centre distribution server.')}>
            <Download className="size-4" />
            Download ExamPro Browser (.exe)
          </Button>
          <Link
            to={path.results}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-slate-50"
          >
            <MonitorCheck className="size-4" />
            View Exam Results
          </Link>
        </div>
      </Card>
    </div>
  );
}
