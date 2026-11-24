import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectCandidate, wordEdited } from '../../model/candidateSlice';
import { Ribbon } from './Ribbon';
import { ZoomControl } from './ZoomControl';

const tabs = ['File', 'Home', 'Insert', 'Design', 'Layout', 'References', 'Review', 'View'];
const commands = [{ group: 'Styles', items: ['Normal', 'Heading 1', 'Heading 2', 'Title'] }];

/** Plain text only until a real document editor is connected. */
export function WordWorkspace() {
  const dispatch = useAppDispatch();
  const text = useAppSelector(selectCandidate).work.word;
  const [zoom, setZoom] = useState(100);

  return (
    <section
      aria-label="Word workspace"
      className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-line"
    >
      <Ribbon tabs={tabs} className="bg-blue-800" commands={commands} />
      <div className="overflow-auto bg-line/60 px-4 pt-5 lg:min-h-0 lg:flex-1">
        <textarea
          aria-label="Document"
          placeholder="Start typing your report here…"
          className="mx-auto block h-84 w-full max-w-3xl lg:h-full resize-none bg-surface px-8 py-8 leading-relaxed shadow-sm"
          style={{ zoom: zoom / 100 }}
          value={text}
          onChange={(event) => dispatch(wordEdited(event.target.value))}
        />
      </div>
      <div className="flex items-center justify-between border-t border-line bg-canvas px-3 py-1 text-sm">
        <span>{text.trim() ? text.trim().split(/\s+/).length : 0} words</span>
        <ZoomControl zoom={zoom} onChange={setZoom} />
      </div>
    </section>
  );
}
