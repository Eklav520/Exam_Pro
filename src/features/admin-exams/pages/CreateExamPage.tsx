import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { path } from '@/shared/config/paths';
import { PageHeader } from '@/shared/ui';
import { useCreateExamMutation } from '../api/adminExamsApi';
import { ExamForm } from '../components/ExamForm';
import { createExamInput, type ExamFormValues } from '../model/examSchema';

export function CreateExamPage() {
  const navigate = useNavigate();
  const [defaultValues] = useState(createExamInput);
  const [createExam, { isLoading, error }] = useCreateExamMutation();

  const handleSubmit = async (input: ExamFormValues) => {
    const result = await createExam(input);
    if (!result.error) await navigate(path.adminExams);
  };

  return (
    <>
      <PageHeader title="New exam" />
      <ExamForm
        defaultValues={defaultValues}
        isSaving={isLoading}
        error={error}
        onSubmit={(input) => void handleSubmit(input)}
      />
    </>
  );
}
