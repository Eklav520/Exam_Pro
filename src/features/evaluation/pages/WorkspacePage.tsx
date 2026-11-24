import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, PageHeader, Tabs, usePreviewAction } from '@/shared/ui';
import { DocumentViewer } from '../components/DocumentViewer';
import { MarksPanel } from '../components/MarksPanel';
import { SectionList } from '../components/SectionList';
import { answerPaper, initialMarks, practicalTasks, type TaskMark } from '../data/sample';
import { getMarksError, toMarks } from '../model/marks';

const emptyMark: TaskMark = { marks: '', remarks: '' };
const firstTaskId = practicalTasks[0]?.id ?? '';

const paperFacts = [
  ['Exam', answerPaper.exam],
  ['Registration No.', answerPaper.registrationNo],
  ['Paper Set', answerPaper.paperSet],
] as const;

export function WorkspacePage() {
  const preview = usePreviewAction();
  const [sectionId, setSectionId] = useState('b');
  const [taskId, setTaskId] = useState(firstTaskId);
  const [marks, setMarks] = useState(initialMarks);
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

  const handleSave = () => {
    if (getMarksError(mark.marks, task.maxMarks)) {
      setShowError(true);
      return;
    }
    preview('Save marks');
    openTask(practicalTasks[taskIndex + 1]?.id);
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

  return (
    <>
      <PageHeader title="Evaluate Answer Paper" />
      <dl className="mb-5 flex flex-wrap gap-x-16 gap-y-2 rounded-xl border border-line bg-table-head px-5 py-3 text-sm">
        {paperFacts.map(([label, value]) => (
          <div key={label} className="flex gap-1.5">
            <dt>{label}:</dt>
            <dd className="font-bold">{value}</dd>
          </div>
        ))}
      </dl>
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
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <Button
                variant="outline"
                disabled={taskIndex === 0}
                onClick={() => openTask(practicalTasks[taskIndex - 1]?.id)}
              >
                <ChevronLeft aria-hidden className="size-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={taskIndex === practicalTasks.length - 1}
                onClick={() => openTask(practicalTasks[taskIndex + 1]?.id)}
              >
                Next
                <ChevronRight aria-hidden className="size-4" />
              </Button>
              <Button onClick={handleSave}>Save &amp; Continue</Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
