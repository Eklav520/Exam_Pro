import { Outlet, type RouteObject } from 'react-router-dom';
import { RequireAuth, RequireRole, RoleHome } from '@/features/auth';
import { path } from '@/shared/config/paths';
import { PageLoader } from '@/shared/ui';
import { AppLayout } from '../layouts/AppLayout';
import { adminRoutes } from './adminRoutes';
import { candidateRoutes } from './candidateRoutes';
import { NotFoundPage } from './NotFoundPage';
import { RouteError } from './RouteError';

export const routes: RouteObject[] = [
  {
    element: <Outlet />,
    errorElement: <RouteError />,
    hydrateFallbackElement: <PageLoader />,
    children: [
      {
        path: path.login,
        lazy: async () => ({
          Component: (await import('@/features/auth/pages/LoginPage')).LoginPage,
        }),
      },
      {
        element: <RequireAuth />,
        children: [
          { path: path.home, element: <RoleHome /> },
          {
            element: <RequireRole role="student" />,
            children: [
              ...candidateRoutes,
              {
                // Full screen: no navigation while an exam is running.
                path: path.attempt,
                lazy: async () => ({
                  Component: (await import('@/features/attempt/pages/AttemptPage')).AttemptPage,
                }),
              },
              {
                element: <AppLayout />,
                children: [
                  {
                    path: path.dashboard,
                    lazy: async () => ({
                      Component: (await import('@/features/dashboard/pages/DashboardPage'))
                        .DashboardPage,
                    }),
                  },
                  {
                    path: path.exams,
                    lazy: async () => ({
                      Component: (await import('@/features/exams/pages/ExamListPage')).ExamListPage,
                    }),
                  },
                  {
                    path: path.examDetail,
                    lazy: async () => ({
                      Component: (await import('@/features/exams/pages/ExamDetailPage'))
                        .ExamDetailPage,
                    }),
                  },
                  {
                    path: path.results,
                    lazy: async () => ({
                      Component: (await import('@/features/results/pages/ResultListPage'))
                        .ResultListPage,
                    }),
                  },
                  {
                    path: path.resultDetail,
                    lazy: async () => ({
                      Component: (await import('@/features/results/pages/ResultDetailPage'))
                        .ResultDetailPage,
                    }),
                  },
                ],
              },
            ],
          },
          {
            element: <RequireRole role="admin" />,
            children: adminRoutes,
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
