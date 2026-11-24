import type { RouteObject } from 'react-router-dom';
import { CandidateStage } from '@/features/candidate';
import { path } from '@/shared/config/paths';

export const candidateRoutes: RouteObject[] = [
  {
    element: <CandidateStage stage="ready" />,
    children: [
      {
        path: path.candidateLaunch,
        lazy: async () => ({
          Component: (await import('@/features/candidate/pages/LaunchPage')).LaunchPage,
        }),
      },
    ],
  },
  {
    element: <CandidateStage stage="running" />,
    children: [
      {
        path: path.candidateHome,
        lazy: async () => ({
          Component: (await import('@/features/candidate/pages/SectionsPage')).SectionsPage,
        }),
      },
      {
        path: path.candidateMcq,
        lazy: async () => ({
          Component: (await import('@/features/candidate/pages/McqPage')).McqPage,
        }),
      },
      {
        path: path.candidateTask,
        lazy: async () => ({
          Component: (await import('@/features/candidate/pages/TaskPage')).TaskPage,
        }),
      },
    ],
  },
  {
    element: <CandidateStage stage="submitted" />,
    children: [
      {
        path: path.candidateSubmitted,
        lazy: async () => ({
          Component: (await import('@/features/candidate/pages/SubmittedPage')).SubmittedPage,
        }),
      },
    ],
  },
];
