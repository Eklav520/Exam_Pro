import { useNavigate, useParams } from 'react-router-dom';
import { path } from '@/shared/config/paths';
import { PageError, PageHeader, PageLoader } from '@/shared/ui';
import { useGetAdminExamQuery, useUpdateExamMutation } from '../api/adminExamsApi';
import { ExamForm } from '../components/ExamForm';
import { toFormValues, type ExamFormValues } from '../model/examSchema';

export function EditExamPage() {
  const { examId = '' } = useParams();
  const navigate = useNavigate();
  const { currentData: exam, error, refetch } = useGetAdminExamQuery(examId);
  const [updateExam, update] = useUpdateExamMutation();

  if (error) return <PageError error={error} onRetry={() => void refetch()} />;
  if (!exam) return <PageLoader label="Loading exam…" />;

  const handleSubmit = async (input: ExamFormValues) => {
    const result = await updateExam({ id: exam.id, input });
    if (!result.error) await navigate(path.adminExams);
  };

  return (
    <>
      <PageHeader title="Edit exam" description={exam.title} />
      <ExamForm
        key={exam.id}
        defaultValues={toFormValues(exam)}
        isSaving={update.isLoading}
        error={update.error}
        onSubmit={(input) => void handleSubmit(input)}
      />
    </>
  );
}
