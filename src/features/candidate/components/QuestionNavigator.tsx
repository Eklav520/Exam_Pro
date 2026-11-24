import { Link } from 'react-router-dom';
import { path, to } from '@/shared/config/paths';
import { sectionA, sectionB, taskIds, tasks } from '../data/sample';

/** Section overview on the examination home. */
export function QuestionNavigator() {
  return (
    <nav aria-label="Question navigator" className="flex flex-col">
      <h2 className="rounded-t-xl bg-navy-800 px-5 py-3.5 font-bold text-white">
        Question Navigator
      </h2>
      <div className="mb-2 rounded-b-xl border border-line px-5 py-3.5">
        <Link to={path.candidateMcq} className="text-sm font-bold hover:underline">
          {sectionA.title}
        </Link>
        <p className="mt-1 text-sm text-muted">{sectionA.questionCount} Questions</p>
      </div>
      <details open className="flex-1 rounded-xl border border-line px-5 py-3.5">
        <summary className="cursor-pointer text-sm font-bold">{sectionB.title}</summary>
        <ul className="mt-2 divide-y divide-line text-sm">
          {taskIds.map((id) => (
            <li key={id}>
              <Link to={to.candidateTask(id)} className="block py-2.5 pl-3 hover:underline">
                {tasks[id].code}. {tasks[id].app} (1)
              </Link>
            </li>
          ))}
        </ul>
      </details>
    </nav>
  );
}
