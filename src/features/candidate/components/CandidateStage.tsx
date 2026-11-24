import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { path } from '@/shared/config/paths';
import { ToastProvider } from '@/shared/ui';
import { selectStage } from '../model/candidateSlice';

const homes = {
  ready: path.candidateLaunch,
  running: path.candidateHome,
  submitted: path.candidateSubmitted,
} as const;

/** Keeps candidates on the screens that match where they are in the exam. */
export function CandidateStage({ stage }: { stage: keyof typeof homes }) {
  const current = useAppSelector(selectStage);
  if (current !== stage) return <Navigate to={homes[current]} replace />;
  return (
    <ToastProvider>
      <Outlet />
    </ToastProvider>
  );
}
