import { Check, ChevronDown, ListChecks, Maximize, Volume2, X } from 'lucide-react';
import { useId, useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { toggleFullscreen } from '@/shared/lib/fullscreen';
import { Button, IconButton, Modal, usePreviewAction } from '@/shared/ui';
import { candidate, type TaskId } from '../data/sample';
import { selectCandidate } from '../model/candidateSlice';
import { CandidateTimer } from './CandidateTimer';
import { ExamHeader } from './ExamHeader';
import { HeaderBadge } from './HeaderBadge';
import { InfoStrip } from './InfoStrip';
import { SectionNavigator } from './SectionNavigator';

interface SectionHeaderProps {
  section: 'A' | 'B';
  title: string;
  /** Shown after the roll number. */
  facts: string[];
  currentTask?: TaskId;
  onSwitchSection: () => void;
}

/** Top of every section screen. Shared so that nothing moves when the section changes. */
export function SectionHeader({
  section,
  title,
  facts,
  currentTask,
  onSwitchSection,
}: SectionHeaderProps) {
  const preview = usePreviewAction();
  const { isSaving } = useAppSelector(selectCandidate);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const navigatorTitleId = useId();
  const closeNavigator = () => setIsNavigatorOpen(false);

  return (
    <>
      <ExamHeader title={title}>
        <HeaderBadge>
          {isSaving ? 'Saving…' : 'Auto Saved'}
          {!isSaving && <Check aria-hidden className="size-3.5" />}
        </HeaderBadge>
        <CandidateTimer variant="header" />
        <span className="flex">
          <IconButton
            inverse
            icon={ListChecks}
            label="Open section navigator"
            className="2xl:hidden"
            onClick={() => setIsNavigatorOpen(true)}
          />
          <IconButton
            inverse
            icon={Maximize}
            label="Toggle full screen"
            onClick={() => void toggleFullscreen()}
          />
          <IconButton inverse icon={Volume2} label="Sound" onClick={() => preview('Sound')} />
        </span>
      </ExamHeader>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3 lg:px-6">
        <InfoStrip items={[`Roll No. : ${candidate.rollNo}`, ...facts]} />
        <Button variant="secondary" size="sm" onClick={onSwitchSection}>
          Section {section}
          <ChevronDown aria-hidden className="size-4" />
          <span className="sr-only">, switch section</span>
        </Button>
      </div>
      <Modal
        open={isNavigatorOpen}
        titleId={navigatorTitleId}
        onClose={closeNavigator}
        className="p-4!"
      >
        <div className="mb-2 flex justify-end">
          <span id={navigatorTitleId} className="sr-only">
            Sections
          </span>
          <IconButton icon={X} label="Close" onClick={closeNavigator} />
        </div>
        {isNavigatorOpen && (
          <SectionNavigator
            currentTask={currentTask}
            onNavigate={closeNavigator}
            onOpenSectionA={() => {
              closeNavigator();
              if (section !== 'A') onSwitchSection();
            }}
          />
        )}
      </Modal>
    </>
  );
}
