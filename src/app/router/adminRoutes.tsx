import type { RouteObject } from 'react-router-dom';
import { EvaluationHome, StaffHome } from '@/features/staff';
import { path } from '@/shared/config/paths';
import { AdminLayout } from '../layouts/admin/AdminLayout';
import { ComingSoonPage } from './ComingSoonPage';

export const adminRoutes: RouteObject[] = [
  { path: path.admin, element: <StaffHome /> },
  { path: path.adminEvaluation, element: <EvaluationHome /> },
  {
    element: <AdminLayout hasSidebar={false} />,
    children: [
      {
        path: path.adminWorkspace,
        lazy: async () => ({
          Component: (await import('@/features/evaluation/pages/WorkspacePage')).WorkspacePage,
        }),
      },
    ],
  },
  {
    element: <AdminLayout />,
    children: [
      {
        path: path.adminDashboard,
        lazy: async () => ({
          Component: (await import('@/features/admin-dashboard/pages/AdminDashboardPage'))
            .AdminDashboardPage,
        }),
      },
      {
        path: path.adminExams,
        lazy: async () => ({
          Component: (await import('@/features/admin-exams/pages/AdminExamListPage'))
            .AdminExamListPage,
        }),
      },
      {
        path: path.adminExamNew,
        lazy: async () => ({
          Component: (await import('@/features/admin-exams/pages/CreateExamPage')).CreateExamPage,
        }),
      },
      {
        path: path.adminExamEdit,
        lazy: async () => ({
          Component: (await import('@/features/admin-exams/pages/EditExamPage')).EditExamPage,
        }),
      },
      {
        path: path.adminQuestionPapers,
        lazy: async () => ({
          Component: (await import('@/features/question-papers/pages/QuestionPapersPage'))
            .QuestionPapersPage,
        }),
      },
      {
        path: path.adminApprovals,
        lazy: async () => ({
          Component: (await import('@/features/approvals/pages/ApprovalsPage')).ApprovalsPage,
        }),
      },
      {
        path: path.adminMonitoring,
        lazy: async () => ({
          Component: (await import('@/features/monitoring/pages/MonitoringPage')).MonitoringPage,
        }),
      },
      {
        path: path.adminAllocation,
        lazy: async () => ({
          Component: (await import('@/features/evaluation/pages/AllocationPage')).AllocationPage,
        }),
      },
      {
        path: path.adminFinalApproval,
        lazy: async () => ({
          Component: (await import('@/features/evaluation/pages/FinalApprovalPage'))
            .FinalApprovalPage,
        }),
      },
      { path: path.adminResults, element: <ComingSoonPage title="Results" /> },
      { path: path.adminUsers, element: <ComingSoonPage title="Users & Roles" /> },
      { path: path.adminReports, element: <ComingSoonPage title="Reports" /> },
      { path: path.adminSettings, element: <ComingSoonPage title="Settings" /> },
    ],
  },
];
