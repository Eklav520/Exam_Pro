import { ChevronDown, ChevronUp, Download, Minus, PanelLeft, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { IconButton, usePreviewAction } from '@/shared/ui';
import type { PracticalTask } from '../data/sample';
import { SampleDocument } from './SampleDocument';

const ZOOM = { min: 50, max: 200, step: 25 };

/** Toolbar and frame. The real document renders in place of SampleDocument. */
export function DocumentViewer({ task }: { task: PracticalTask }) {
  const preview = usePreviewAction();
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  return (
    <section
      aria-label={`${task.label} answer`}
      className="min-w-0 overflow-hidden rounded-xl border border-line"
    >
      <div className="flex flex-wrap items-center justify-center gap-1 border-b border-line bg-canvas px-2 py-1.5">
        <IconButton
          icon={PanelLeft}
          label="Show page thumbnails"
          className="mr-auto"
          onClick={() => preview('Page thumbnails')}
        />
        <IconButton
          icon={ChevronUp}
          label="Previous page"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        />
        <span className="rounded border border-line bg-surface px-3 py-1 text-sm tabular-nums">
          {page} / {task.pages}
        </span>
        <IconButton
          icon={ChevronDown}
          label="Next page"
          disabled={page === task.pages}
          onClick={() => setPage(page + 1)}
        />
        <span aria-hidden className="mx-2 h-5 w-px bg-line" />
        <IconButton
          icon={Minus}
          label="Zoom out"
          disabled={zoom === ZOOM.min}
          onClick={() => setZoom(zoom - ZOOM.step)}
        />
        <span className="w-12 text-center text-sm tabular-nums">{zoom}%</span>
        <IconButton
          icon={Plus}
          label="Zoom in"
          disabled={zoom === ZOOM.max}
          onClick={() => setZoom(zoom + ZOOM.step)}
        />
        <span className="ml-auto flex">
          <IconButton
            icon={Search}
            label="Search document"
            onClick={() => preview('Search document')}
          />
          <IconButton
            icon={Download}
            label="Download document"
            onClick={() => preview('Download document')}
          />
        </span>
      </div>
      <div
        tabIndex={0}
        role="group"
        aria-label="Document"
        className="h-104 overflow-auto bg-line/60 px-4 sm:px-10"
      >
        <div
          className="mx-auto min-h-full max-w-2xl bg-surface px-6 py-8 sm:px-10"
          style={{ zoom: zoom / 100 }}
        >
          <SampleDocument taskId={task.id} page={page} />
        </div>
      </div>
    </section>
  );
}
