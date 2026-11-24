import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '@/shared/api/getErrorMessage';
import { path, to } from '@/shared/config/paths';
import { formatDuration } from '@/shared/lib/format';
import type { ExamSummary } from '@/shared/types';
import {
  Alert,
  Badge,
  Button,
  buttonClass,
  ConfirmDialog,
  EmptyState,
  PageError,
  PageHeader,
  PageLoader,
} from '@/shared/ui';
import { useDeleteExamMutation, useGetAdminExamsQuery } from '../api/adminExamsApi';

export function AdminExamListPage() {
  const { data: exams, error, refetch } = useGetAdminExamsQuery();
  const [deleteExam, deletion] = useDeleteExamMutation();
  const [target, setTarget] = useState<ExamSummary | null>(null);

  const handleDelete = async () => {
    if (!target) return;
    await deleteExam(target.id);
    setTarget(null);
  };

  return (
    <>
      <PageHeader
        title="Examinations"
        description="Create, publish and update exams."
        actions={
          <Link to={path.adminExamNew} className={buttonClass()}>
            New exam
          </Link>
        }
      />
      {deletion.error && (
        <div className="mb-4">
          <Alert>{getErrorMessage(deletion.error)}</Alert>
        </div>
      )}
      {error && <PageError error={error} onRetry={() => void refetch()} />}
      {!exams && !error && <PageLoader label="Loading exams…" />}
      {exams?.length === 0 && (
        <EmptyState title="No exams yet">Create your first exam to get started.</EmptyState>
      )}
      {exams && exams.length > 0 && (
        <div className="relative overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Exam</th>
                <th className="px-4 py-3 font-medium">Questions</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{exam.title}</p>
                    <p className="text-muted">{exam.subject}</p>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{exam.questionCount}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDuration(exam.durationMinutes)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={exam.status === 'published' ? 'success' : 'neutral'}>
                      {exam.status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={to.adminExamEdit(exam.id)}
                        aria-label={`Edit ${exam.title}`}
                        className={buttonClass('secondary', 'sm')}
                      >
                        Edit
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Delete ${exam.title}`}
                        onClick={() => setTarget(exam)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog
        open={target !== null}
        title={`Delete “${target?.title ?? ''}”?`}
        confirmLabel="Delete exam"
        danger
        isLoading={deletion.isLoading}
        onCancel={() => setTarget(null)}
        onConfirm={() => void handleDelete()}
      >
        Students can no longer start it. Results already submitted are kept.
      </ConfirmDialog>
    </>
  );
}
