import clsx from 'clsx';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/shared/ui';
import { selectCandidate, slideAdded, slideEdited, type Slide } from '../../model/candidateSlice';
import { Ribbon } from './Ribbon';

const tabs = ['File', 'Home', 'Insert', 'Design', 'Transitions', 'Animations', 'Review', 'View'];
const commands = [{ group: 'Slides', items: ['Layout', 'Reset', 'Section'] }];

/** Title and text only until a real presentation editor is connected. */
export function PowerPointWorkspace() {
  const dispatch = useAppDispatch();
  const slides = useAppSelector(selectCandidate).work.powerpoint;
  const [active, setActive] = useState(0);
  const slide = slides[active] ?? { title: '', body: '' };
  const edit = (change: Partial<Slide>) => dispatch(slideEdited({ index: active, change }));

  return (
    <section
      aria-label="PowerPoint workspace"
      className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-line"
    >
      <Ribbon tabs={tabs} className="bg-orange-700" commands={commands} />
      <div className="flex flex-col bg-line/60 sm:h-112 sm:flex-row lg:h-auto lg:min-h-0 lg:flex-1">
        <div className="flex gap-2 overflow-auto border-line bg-canvas p-3 sm:w-36 sm:shrink-0 sm:flex-col sm:border-r">
          {slides.map((item, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Slide ${index + 1}`}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              className={clsx(
                'flex aspect-video w-28 shrink-0 items-center justify-center overflow-hidden rounded border-2 bg-surface p-1 text-[0.625rem]',
                index === active ? 'border-orange-600' : 'border-line',
              )}
            >
              {item.title || `Slide ${index + 1}`}
            </button>
          ))}
          <Button
            variant="secondary"
            size="sm"
            className="w-28 shrink-0 gap-1! px-2! whitespace-nowrap"
            onClick={() => {
              dispatch(slideAdded());
              setActive(slides.length);
            }}
          >
            <Plus aria-hidden className="size-4" />
            New slide
          </Button>
        </div>
        {/* The slide is as large as fits while staying 16:9. */}
        <div className="m-5 flex h-64 items-center justify-center [container-type:size] sm:h-auto sm:flex-1">
          <div
            className="flex aspect-video flex-col gap-3 bg-surface p-6 shadow-sm"
            style={{ width: 'min(100cqw, 177.78cqh)' }}
          >
            <input
              aria-label="Slide title"
              placeholder="Click to add title"
              className="text-center text-2xl font-bold"
              value={slide.title}
              onChange={(event) => edit({ title: event.target.value })}
            />
            <textarea
              aria-label="Slide text"
              placeholder="Click to add text"
              className="flex-1 resize-none"
              value={slide.body}
              onChange={(event) => edit({ body: event.target.value })}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
