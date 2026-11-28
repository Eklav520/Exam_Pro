import { ArrowLeft, ChevronLeft, ChevronRight, Clock, Save } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { path } from '@/shared/config/paths';
import { Button, Card, Tabs, useToast } from '@/shared/ui';
import { DocumentViewer } from '../components/DocumentViewer';
import { MarksPanel } from '../components/MarksPanel';
import { SectionList } from '../components/SectionList';
import { answerPaper, initialMarks, practicalTasks, type TaskMark } from '../data/sample';
import { loadDraft, saveDraft } from '../model/evaluationDraft';
import { getMarksError, toMarks } from '../model/marks';

const emptyMark: TaskMark = { marks: '', remarks: '' };
const firstTaskId = practicalTasks[0]?.id ?? '';

export function WorkspacePage() {
  const toast = useToast();
  const navigate = useNavigate();
  // Picks up where the evaluator stopped, if they saved and closed earlier.
  const [draft] = useState(() => loadDraft(answerPaper.registrationNo));
  const [sectionId, setSectionId] = useState('b');
  const [taskId, setTaskId] = useState(draft?.taskId ?? firstTaskId);
  const [marks, setMarks] = useState(draft?.marks ?? initialMarks);
  const [savedAt, setSavedAt] = useState(draft?.savedAt ?? null);
  const [showError, setShowError] = useState(false);

  const taskIndex = practicalTasks.findIndex((item) => item.id === taskId);
  const task = practicalTasks[taskIndex];
  if (!task) return null;

  const mark = marks[task.id] ?? emptyMark;
  const { mcq } = answerPaper;

  const openTask = (id: string | undefined) => {
    if (id === undefined) return;
    setTaskId(id);
    setShowError(false);
  };

  const persist = (nextTaskId: string) => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    saveDraft(answerPaper.registrationNo, { marks, taskId: nextTaskId, savedAt: time });
    setSavedAt(time);
  };

  const handleSave = () => {
    if (getMarksError(mark.marks, task.maxMarks)) {
      setShowError(true);
      return;
    }
    const nextId = practicalTasks[taskIndex + 1]?.id;
    persist(nextId ?? task.id);
    toast(`Marks for ${task.label} saved.`);
    openTask(nextId);
  };

  /** Keeps everything entered so far, even unfinished tasks, and leaves for a break. */
  const handleSaveAndClose = () => {
    // A half-typed mark may be left empty, but not wrong.
    if (mark.marks !== '' && getMarksError(mark.marks, task.maxMarks)) {
      setShowError(true);
      return;
    }
    persist(task.id);
    toast(
      `Progress saved for ${answerPaper.registrationNo}. Continue from ${task.label} any time.`,
    );
    void navigate(path.adminAssignedPapers);
  };

  const sections = [
    {
      id: 'a',
      title: 'Section A – MCQ',
      detail: `${mcq.questions} Questions`,
      score: mcq.score,
      total: mcq.total,
      isComplete: true,
    },
    {
      id: 'b',
      title: 'Section B – Practical',
      detail: `${practicalTasks.length} Tasks`,
      score: practicalTasks.reduce(
        (sum, item) => sum + toMarks(marks[item.id]?.marks, item.maxMarks),
        0,
      ),
      total: practicalTasks.reduce((sum, item) => sum + item.maxMarks, 0),
      isComplete: practicalTasks.every(
        (item) => !getMarksError(marks[item.id]?.marks ?? '', item.maxMarks),
      ),
    },
  ];

  const totalScore = sections.reduce((sum, item) => sum + item.score, 0);
  const totalMarks = sections.reduce((sum, item) => sum + item.total, 0);

  return (
    <>
      <header className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border border-line bg-surface px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to={path.adminAssignedPapers}
            aria-label="Back to assigned papers"
            title="Back to assigned papers"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-line text-ink hover:bg-canvas"
          >
            <ArrowLeft aria-hidden className="size-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg leading-tight font-bold">Evaluate Answer Paper</h1>
            <p className="truncate text-sm text-muted">
              {answerPaper.exam} · {answerPaper.paperSet}
            </p>
          </div>
        </div>
        <dl className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
          <div className="flex items-center gap-2">
            <dt className="text-muted">Registration No.</dt>
            <dd className="rounded-md bg-table-head px-2 py-0.5 font-semibold tabular-nums">
              {answerPaper.registrationNo}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-muted">Total so far</dt>
            <dd className="font-semibold tabular-nums">
              {totalScore} / {totalMarks}
            </dd>
          </div>
        </dl>
      </header>
      <div className="grid items-start gap-4 lg:grid-cols-[17rem_1fr]">
        <SectionList sections={sections} activeId={sectionId} onSelect={setSectionId} />
        {sectionId === 'a' ? (
          <Card>
            <h2 className="font-bold">Section A – MCQ</h2>
            <p className="mt-2 text-muted">
              {mcq.questions} questions, marked automatically. Score: {mcq.score} / {mcq.total}.
            </p>
          </Card>
        ) : (
          <div className="min-w-0">
            <Tabs
              label="Practical tasks"
              tabs={practicalTasks.map((item) => ({
                id: item.id,
                label: `${item.label} (${item.maxMarks})`,
              }))}
              active={task.id}
              onChange={openTask}
            >
              <div className="grid items-start gap-4 xl:grid-cols-[1fr_16rem]">
                <DocumentViewer key={task.id} task={task} />
                <MarksPanel
                  task={task}
                  value={mark}
                  error={showError ? getMarksError(mark.marks, task.maxMarks) : undefined}
                  onChange={(value) => setMarks({ ...marks, [task.id]: value })}
                />
              </div>
            </Tabs>
          </div>
        )}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 lg:ml-[18rem]">
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <Clock aria-hidden className="size-4" />
          {savedAt ? `Progress saved at ${savedAt}` : 'Not saved yet'}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={handleSaveAndClose}>
            <Save aria-hidden className="size-4" />
            Save &amp; Close
          </Button>
          {sectionId === 'b' && (
            <>
              <span aria-hidden className="mx-1 h-6 w-px bg-line" />
              <Button
                variant="secondary"
                disabled={taskIndex === 0}
                onClick={() => openTask(practicalTasks[taskIndex - 1]?.id)}
              >
                <ChevronLeft aria-hidden className="size-4" />
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={taskIndex === practicalTasks.length - 1}
                onClick={() => openTask(practicalTasks[taskIndex + 1]?.id)}
              >
                Next
                <ChevronRight aria-hidden className="size-4" />
              </Button>
              <Button onClick={handleSave}>Save &amp; Continue</Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
