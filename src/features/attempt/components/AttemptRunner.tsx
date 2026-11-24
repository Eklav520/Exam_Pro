import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { getErrorMessage } from '@/shared/api/getErrorMessage';
import { to } from '@/shared/config/paths';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import type { Attempt } from '@/shared/types';
import { Alert, Button, ConfirmDialog } from '@/shared/ui';
import { useSubmitAttemptMutation } from '../api/attemptApi';
import {
  answerCleared,
  markToggled,
  optionToggled,
  questionOpened,
  selectAttempt,
  selectPalette,
  selectSaveStatus,
} from '../model/attemptSlice';
import { CountdownTimer } from './CountdownTimer';
import { QuestionPalette } from './QuestionPalette';
import { QuestionView } from './QuestionView';
import { SaveIndicator } from './SaveIndicator';

export function AttemptRunner({ attempt }: { attempt: Attempt }) {
  useDocumentTitle(attempt.examTitle);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentIndex, answers, marked, deadline, revision } = useAppSelector(selectAttempt);
  const palette = useAppSelector(selectPalette);
  const saveStatus = useAppSelector(selectSaveStatus);
  const [submitAttempt, submission] = useSubmitAttemptMutation();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  const hasUnsavedChanges = saveStatus !== 'saved';
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasUnsavedChanges]);

  const handleSubmit = async () => {
    if (submission.isLoading) return;
    const result = await submitAttempt({ attemptId: attempt.id, answers, revision });
    setIsConfirming(false);
    if (!result.error) await navigate(to.resultDetail(attempt.id), { replace: true });
  };

  const handleExpire = () => {
    setIsExpired(true);
    setIsConfirming(false);
    void handleSubmit();
  };

  const question = attempt.questions[currentIndex];
  const total = attempt.questions.length;
  const unanswered = palette.filter((item) => item.status !== 'answered').length;
  const isLocked = isExpired || submission.isLoading;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <h1 className="font-semibold">{attempt.examTitle}</h1>
          <SaveIndicator status={saveStatus} />
          <div className="ml-auto flex items-center gap-4">
            <CountdownTimer deadline={deadline} onExpire={handleExpire} />
            <Button
              onClick={() => setIsConfirming(true)}
              disabled={isExpired}
              isLoading={submission.isLoading}
            >
              Submit exam
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-4 px-4 py-6">
        {isExpired && submission.isLoading && (
          <p role="status" className="text-sm text-muted">
            Time is up. Submitting your answers…
          </p>
        )}
        {submission.error && (
          <Alert
            action={
              <Button variant="secondary" size="sm" onClick={() => void handleSubmit()}>
                Submit again
              </Button>
            }
          >
            {isExpired && 'Time is up, but your exam was not submitted. '}
            {getErrorMessage(submission.error)}
          </Alert>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_18rem]">
          <main>
            {question && (
              <QuestionView
                key={question.id}
                question={question}
                number={currentIndex + 1}
                total={total}
                selectedOptionIds={answers[question.id] ?? []}
                isMarked={marked.includes(question.id)}
                isLocked={isLocked}
                onToggleOption={(optionId) =>
                  dispatch(
                    optionToggled({ questionId: question.id, optionId, type: question.type }),
                  )
                }
                onClear={() => dispatch(answerCleared(question.id))}
                onToggleMark={() => dispatch(markToggled(question.id))}
              />
            )}
            <div className="mt-4 flex justify-between">
              <Button
                variant="secondary"
                disabled={currentIndex === 0}
                onClick={() => dispatch(questionOpened(currentIndex - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={currentIndex >= total - 1}
                onClick={() => dispatch(questionOpened(currentIndex + 1))}
              >
                Next
              </Button>
            </div>
          </main>
          <QuestionPalette
            items={palette}
            currentIndex={currentIndex}
            onSelect={(index) => dispatch(questionOpened(index))}
          />
        </div>
      </div>

      <ConfirmDialog
        open={isConfirming}
        title="Submit this exam?"
        confirmLabel="Submit"
        isLoading={submission.isLoading}
        onCancel={() => setIsConfirming(false)}
        onConfirm={() => void handleSubmit()}
      >
        {unanswered > 0
          ? `${unanswered} of ${total} questions are unanswered. `
          : `All ${total} questions are answered. `}
        You cannot change your answers after submitting.
      </ConfirmDialog>
    </div>
  );
}
