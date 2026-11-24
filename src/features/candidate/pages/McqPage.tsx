import clsx from 'clsx';
import { ArrowLeft, ArrowRight, Bookmark } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { path } from '@/shared/config/paths';
import { Button, buttonClass } from '@/shared/ui';
import { Palette } from '../components/Palette';
import { SectionHeader } from '../components/SectionHeader';
import { SwitchSectionDialog } from '../components/SwitchSectionDialog';
import { questions } from '../data/questions';
import { sectionA } from '../data/sample';
import {
  markToggled,
  optionChosen,
  questionOpened,
  selectCandidate,
  selectPalette,
} from '../model/candidateSlice';

export function McqPage() {
  const dispatch = useAppDispatch();
  const { currentQuestion, answers, marked } = useAppSelector(selectCandidate);
  const palette = useAppSelector(selectPalette);
  const [isSwitching, setIsSwitching] = useState(false);

  const question = questions[currentQuestion];
  if (!question) return null;

  const isMarked = marked.includes(currentQuestion);
  const isLast = currentQuestion === questions.length - 1;

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <SectionHeader
        section="A"
        title={sectionA.title}
        facts={['Section A (MCQ)', `${sectionA.questionCount} Questions`]}
        onSwitchSection={() => setIsSwitching(true)}
      />
      <main className="flex w-full flex-1 flex-col px-4 py-3 lg:px-6">
        <div className="grid flex-1 gap-5 lg:grid-cols-[1fr_17rem]">
          <section className="flex flex-col rounded-xl border border-line p-4 sm:p-5">
            <h2 id="question-text" className="mb-5 flex gap-5">
              <span className="h-fit rounded-lg bg-info-soft px-4 py-2 font-bold whitespace-nowrap">
                Q. {currentQuestion + 1}
              </span>
              <span className="pt-1.5 text-lg leading-snug font-bold 2xl:text-xl">
                {question.text}
              </span>
            </h2>
            <div
              role="radiogroup"
              aria-labelledby="question-text"
              className="min-h-64 flex-1 rounded-xl border border-line p-3 sm:px-8"
            >
              {question.options.map((option, index) => {
                const isSelected = answers[currentQuestion] === index;
                return (
                  <label
                    key={option}
                    className={clsx(
                      'flex cursor-pointer items-center gap-5 rounded-lg px-4 py-3.5 2xl:py-5 2xl:text-lg',
                      isSelected ? 'bg-[#cdf5dc]' : 'hover:bg-canvas',
                    )}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      checked={isSelected}
                      onChange={() =>
                        dispatch(optionChosen({ question: currentQuestion, option: index }))
                      }
                      className="size-5 accent-brand-700"
                    />
                    {String.fromCharCode(65 + index)}) {option}
                  </label>
                );
              })}
            </div>
            <div className="mt-5 flex flex-wrap justify-between gap-3">
              <Button
                variant="secondary"
                disabled={currentQuestion === 0}
                onClick={() => dispatch(questionOpened(currentQuestion - 1))}
              >
                <ArrowLeft aria-hidden className="size-4" />
                Previous
              </Button>
              <Button
                variant="secondary"
                aria-pressed={isMarked}
                className={isMarked ? 'border-amber-400! bg-amber-100!' : undefined}
                onClick={() => dispatch(markToggled(currentQuestion))}
              >
                <Bookmark aria-hidden className={clsx('size-4', isMarked && 'fill-current')} />
                {isMarked ? 'Marked for Review' : 'Mark for Review'}
              </Button>
              {isLast ? (
                <Link to={path.candidateHome} className={buttonClass()}>
                  Save &amp; Finish
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              ) : (
                <Button onClick={() => dispatch(questionOpened(currentQuestion + 1))}>
                  Save &amp; Next
                  <ArrowRight aria-hidden className="size-4" />
                </Button>
              )}
            </div>
          </section>
          <div className="flex flex-col gap-4">
            <Palette statuses={palette} onSelect={(index) => dispatch(questionOpened(index))} />
            <Link to={path.candidateHome} className={`${buttonClass('secondary')} w-full`}>
              <ArrowLeft aria-hidden className="size-4" />
              Back to Sections
            </Link>
          </div>
        </div>
      </main>
      <SwitchSectionDialog open={isSwitching} current="a" onClose={() => setIsSwitching(false)} />
    </div>
  );
}
