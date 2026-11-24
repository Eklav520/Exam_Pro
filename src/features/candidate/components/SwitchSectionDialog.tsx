import clsx from 'clsx';
import { ArrowLeftRight, X } from 'lucide-react';
import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { path, to } from '@/shared/config/paths';
import { Button, IconButton, Modal } from '@/shared/ui';
import { sectionA, sectionB } from '../data/sample';

type SectionId = 'a' | 'b';

const options: { id: SectionId; title: string; detail: string; to: string }[] = [
  {
    id: 'a',
    title: sectionA.title,
    detail: `(${sectionA.questionCount} Questions)`,
    to: path.candidateMcq,
  },
  { id: 'b', title: sectionB.title, detail: '(Word, Excel, PPT)', to: to.candidateTask('word') },
];

interface SwitchSectionDialogProps {
  open: boolean;
  current: SectionId;
  onClose: () => void;
}

export function SwitchSectionDialog({ open, current, onClose }: SwitchSectionDialogProps) {
  const navigate = useNavigate();
  const titleId = useId();
  const [selected, setSelected] = useState<SectionId>(current === 'a' ? 'b' : 'a');

  const handleSwitch = () => {
    onClose();
    const target = options.find((option) => option.id === selected);
    if (target && selected !== current) void navigate(target.to);
  };

  return (
    <Modal open={open} titleId={titleId} onClose={onClose} className="max-w-lg">
      <div className="flex items-start gap-4">
        <span className="rounded-xl bg-info-soft p-3 text-info">
          <ArrowLeftRight aria-hidden className="size-6" />
        </span>
        <div className="flex-1">
          <h2 id={titleId} className="text-xl font-bold">
            Switch Section
          </h2>
          <p className="text-sm">Do you want to switch to another section?</p>
        </div>
        <IconButton icon={X} label="Close" onClick={onClose} />
      </div>
      <fieldset className="mt-5 space-y-2">
        <legend className="sr-only">Section</legend>
        {options.map((option) => (
          <label
            key={option.id}
            className={clsx(
              'flex cursor-pointer items-center gap-4 rounded-lg border px-4 py-3 text-sm',
              option.id === selected ? 'border-emerald-300 bg-[#d7fcec]' : 'border-line',
            )}
          >
            <input
              type="radio"
              name="section"
              checked={option.id === selected}
              onChange={() => setSelected(option.id)}
              className="size-4.5 accent-brand-700"
            />
            <span className="flex-1 font-semibold">{option.title}</span>
            <span>{option.detail}</span>
          </label>
        ))}
      </fieldset>
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSwitch}>Switch Section</Button>
      </div>
    </Modal>
  );
}
