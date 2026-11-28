import { nanoid } from '@reduxjs/toolkit';
import { ArrowLeft, ArrowRight, BadgeCheck, Send } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useStaffRole } from '@/features/staff';
import { path } from '@/shared/config/paths';
import { getPatternTotals } from '@/shared/lib/examPattern';
import type { QuestionGroup } from '@/shared/types';
import { Alert, Button, Card, ItemTable, PageHeader, Stepper, useToast } from '@/shared/ui';
import {
  createPaper,
  getNextSetName,
  getPaperIssues,
  getPaperTotals,
  usesPattern,
  type McqItem,
  type PaperSet,
  type PatternQuestion,
  type PracticalItem,
} from '../../model/paper';
import { paperSaved, paperSubmitted, selectPapers } from '../../model/papersSlice';
import { PaperSections } from '../PaperSections';
import { DetailsStep } from './DetailsStep';
import { McqDialog } from './McqDialog';
import { PatternQuestionDialog } from './PatternQuestionDialog';
import { SectionQuestionsStep } from './SectionQuestionsStep';
import { TaskDialog } from './TaskDialog';

const freeSteps = ['Paper Details', 'Part A – MCQ', 'Part B – Practical', 'Review'] as const;

type OpenDialog =
  | { type: 'mcq'; item: McqItem | null }
  | { type: 'task'; item: PracticalItem | null }
  | { type: 'pattern'; group: QuestionGroup; slot: string; item: PatternQuestion | null };

function upsert<Item extends { id: string }>(items: Item[], item: Item): Item[] {
  return items.some((existing) => existing.id === item.id)
    ? items.map((existing) => (existing.id === item.id ? item : existing))
    : [...items, item];
}

const remove = <Item extends { id: string }>(items: Item[], id: string) =>
  items.filter((item) => item.id !== id);

/** Saves the draft on every step and whenever its questions change. */
export function PaperWizard({ initial }: { initial: PaperSet }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const role = useStaffRole();
  const papers = useAppSelector(selectPapers);
  const [isNew] = useState(() => !papers.some((item) => item.id === initial.id));
  const [paper, setPaper] = useState(initial);
  const [step, setStep] = useState(0);
  const [dialog, setDialog] = useState<OpenDialog | null>(null);
  const [showTitleError, setShowTitleError] = useState(false);

  // A set assigned with the exam's pattern has a step per part of the pattern.
  const sections = usesPattern(paper) ? (paper.pattern ?? []) : [];
  const steps = usesPattern(paper)
    ? [
        'Paper Details',
        ...sections.map(
          (section) => `${section.name}${section.title ? ` – ${section.title}` : ''}`,
        ),
        'Review',
      ]
    : freeSteps;
  const isReview = step === steps.length - 1;
  const required = usesPattern(paper) ? getPatternTotals(sections) : null;
  const patternSection = step > 0 && !isReview ? sections[step - 1] : undefined;
  const issues = getPaperIssues(paper);
  const totals = getPaperTotals(paper);
  const titleError =
    showTitleError && paper.title.trim().length < 3 ? 'Use at least 3 characters' : undefined;

  const change = (update: Partial<PaperSet>) => setPaper({ ...paper, ...update });

  /** Questions take time to write, so they are saved straight away. */
  const changeItems = (
    update: Pick<PaperSet, 'mcqs'> | Pick<PaperSet, 'tasks'> | Pick<PaperSet, 'questions'>,
  ) => {
    const updated = { ...paper, ...update };
    setPaper(updated);
    dispatch(paperSaved(updated));
  };

  const changeExam = (exam: string) => {
    const others = papers.filter((item) => item.id !== paper.id);
    const { name, title } = createPaper(exam, getNextSetName(others, exam));
    change({ exam, name, title });
  };

  const goTo = (next: number) => {
    dispatch(paperSaved(paper));
    setStep(next);
  };

  const handleNext = () => {
    if (paper.title.trim().length < 3) {
      setShowTitleError(true);
      setStep(0);
      return;
    }
    goTo(step + 1);
    toast('Draft saved.');
  };

  const handleSubmit = () => {
    dispatch(paperSaved(paper));
    dispatch(paperSubmitted(paper.id));
    toast(`${paper.name} is sent to the Higher Official for approval.`);
    void navigate(path.adminQuestionPapers);
  };

  return (
    <>
      <PageHeader
        title={`${isNew ? 'Create' : 'Edit'} Question Paper – ${paper.name}`}
        description={`Exam: ${paper.exam}`}
        actions={
          <span className="flex items-center gap-2 rounded-full bg-violet px-4 py-2 text-sm font-semibold text-white">
            <BadgeCheck aria-hidden className="size-4" />
            Role: {role.label}
          </span>
        }
      />
      {paper.remarks && (
        <div className="mb-5">
          <Alert>Returned for modification: {paper.remarks}</Alert>
        </div>
      )}
      <Stepper steps={steps} current={step} onSelect={goTo} />

      {step === 0 && (
        <DetailsStep
          paper={paper}
          titleError={titleError}
          onExamChange={changeExam}
          onTitleChange={(title) => change({ title })}
        />
      )}
      {patternSection && (
        <SectionQuestionsStep
          paper={paper}
          section={patternSection}
          onAdd={(group, slot) => setDialog({ type: 'pattern', group, slot, item: null })}
          onEdit={(group, item, slot) => setDialog({ type: 'pattern', group, slot, item })}
          onDelete={(item) => changeItems({ questions: remove(paper.questions ?? [], item.id) })}
        />
      )}
      {sections.length === 0 && step === 1 && (
        <ItemTable
          title="Part A – Multiple Choice Questions"
          itemName="Question"
          items={paper.mcqs}
          onAdd={() => setDialog({ type: 'mcq', item: null })}
          onEdit={(item) => setDialog({ type: 'mcq', item })}
          onDelete={(item) => changeItems({ mcqs: remove(paper.mcqs, item.id) })}
          columns={[
            {
              header: 'Question',
              cell: (item) => (
                <span className="block max-w-md truncate" title={item.text}>
                  {item.text}
                </span>
              ),
            },
            { header: 'Options', cell: (item) => `${item.options.length} Options` },
            {
              header: 'Answer',
              align: 'center',
              cell: (item) => String.fromCharCode(65 + item.correctIndex),
            },
          ]}
        />
      )}
      {sections.length === 0 && step === 2 && (
        <ItemTable
          title="Part B – Practical Tasks"
          itemName="Task"
          items={paper.tasks}
          onAdd={() => setDialog({ type: 'task', item: null })}
          onEdit={(item) => setDialog({ type: 'task', item })}
          onDelete={(item) => changeItems({ tasks: remove(paper.tasks, item.id) })}
          columns={[
            { header: 'Application', cell: (item) => item.app },
            { header: 'Task', cell: (item) => item.title },
            {
              header: 'Instructions',
              cell: (item) => (
                <span className="block max-w-sm truncate" title={item.instructions}>
                  {item.instructions}
                </span>
              ),
            },
          ]}
        />
      )}
      {isReview && (
        <div className="space-y-5">
          {issues.length > 0 && (
            <Alert>
              <ul className="list-disc pl-5">
                {issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </Alert>
          )}
          <Card>
            <dl className="grid gap-4 sm:grid-cols-4">
              {(
                [
                  ['Paper Title', paper.title],
                  ['Examination', paper.exam],
                  [
                    'Total Questions',
                    required ? `${totals.questions} of ${required.questions}` : totals.questions,
                  ],
                  ['Total Marks', required ? `${totals.marks} of ${required.marks}` : totals.marks],
                ] as const
              ).map(([label, value]) => (
                <div key={label}>
                  <dt className="text-sm text-muted">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card>
            <PaperSections paper={paper} />
          </Card>
        </div>
      )}

      <div className="mt-6 flex justify-center gap-3 sm:justify-end">
        <Button
          variant="secondary"
          onClick={() => {
            if (step > 0) goTo(step - 1);
            else void navigate(path.adminQuestionPapers);
          }}
        >
          <ArrowLeft aria-hidden className="size-4" />
          {step > 0 ? 'Previous' : 'Back to list'}
        </Button>
        {isReview ? (
          <Button disabled={issues.length > 0} onClick={handleSubmit}>
            <Send aria-hidden className="size-4" />
            Submit for Approval
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Save &amp; Next
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        )}
      </div>

      {dialog?.type === 'mcq' && (
        <McqDialog
          item={dialog.item}
          onClose={() => setDialog(null)}
          onSave={(values) => {
            const id = dialog.item?.id ?? nanoid();
            changeItems({ mcqs: upsert(paper.mcqs, { id, ...values }) });
            setDialog(null);
          }}
        />
      )}
      {dialog?.type === 'pattern' && (
        <PatternQuestionDialog
          group={dialog.group}
          slot={dialog.slot}
          item={dialog.item}
          onClose={() => setDialog(null)}
          onSave={(values) => {
            const { group, item } = dialog;
            const question: PatternQuestion = {
              id: item?.id ?? nanoid(),
              groupId: group.id,
              type: group.type,
              ...values,
            };
            changeItems({ questions: upsert(paper.questions ?? [], question) });
            setDialog(null);
          }}
        />
      )}
      {dialog?.type === 'task' && (
        <TaskDialog
          item={dialog.item}
          onClose={() => setDialog(null)}
          onSave={(values) => {
            const id = dialog.item?.id ?? nanoid();
            changeItems({ tasks: upsert(paper.tasks, { id, ...values }) });
            setDialog(null);
          }}
        />
      )}
    </>
  );
}
