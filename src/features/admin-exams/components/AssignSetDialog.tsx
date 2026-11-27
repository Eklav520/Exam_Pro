import { useId, useState, type FormEvent } from 'react';
import type { PaperSetter } from '@/features/question-papers';
import { Button, Field, Modal } from '@/shared/ui';

export interface Assignment {
  name: string;
  setter: PaperSetter;
  dueDate: string;
}

interface AssignSetDialogProps {
  /** "Set 3": the next free name for this exam. */
  name: string;
  /** Set being copied, when duplicating. */
  copyOf: string | null;
  setters: PaperSetter[];
  /** Setter ids that already have a set of this exam. */
  busySetterIds: Set<string>;
  takenNames: Set<string>;
  onAssign: (assignment: Assignment) => void;
  onClose: () => void;
}

/** Mount while open, so every opening starts from fresh values. */
export function AssignSetDialog({
  name: initialName,
  copyOf,
  setters,
  busySetterIds,
  takenNames,
  onAssign,
  onClose,
}: AssignSetDialogProps) {
  const titleId = useId();
  const [name, setName] = useState(initialName);
  const [setterId, setSetterId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const nameError = !name.trim()
    ? 'Enter a set name'
    : takenNames.has(name.trim())
      ? `${name.trim()} already exists for this exam`
      : undefined;
  // Each set goes to a different person, so no one setter knows two papers.
  const setterError = !setterId
    ? 'Choose a paper setter'
    : busySetterIds.has(setterId)
      ? 'This setter already has a set of this exam. Choose someone else.'
      : undefined;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitted(true);
    const setter = setters.find((item) => item.id === setterId);
    if (nameError || setterError || !setter) return;
    onAssign({ name: name.trim(), setter, dueDate });
  };

  return (
    <Modal open titleId={titleId} onClose={onClose} className="max-w-lg!">
      <h2 id={titleId} className="mb-1 text-lg font-bold">
        {copyOf ? `Duplicate ${copyOf}` : 'Assign Paper Set'}
      </h2>
      <p className="mb-4 text-sm text-muted">
        The new set uses the same pattern as the exam. Its questions are prepared by the setter.
      </p>
      <form noValidate className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Set Name" required error={isSubmitted ? nameError : undefined}>
          {(props) => (
            <input {...props} value={name} onChange={(event) => setName(event.target.value)} />
          )}
        </Field>
        <Field label="Paper Setter" required error={isSubmitted ? setterError : undefined}>
          {(props) => (
            <select
              {...props}
              value={setterId}
              onChange={(event) => setSetterId(event.target.value)}
            >
              <option value="">Select a paper setter</option>
              {setters.map((setter) => (
                <option key={setter.id} value={setter.id}>
                  {setter.name}
                  {busySetterIds.has(setter.id) ? ' (has a set already)' : ''}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Due Date" hint="When the set should be sent for approval. Optional.">
          {(props) => (
            <input
              {...props}
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          )}
        </Field>
        <div className="flex justify-end gap-3 border-t border-line pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Assign Set</Button>
        </div>
      </form>
    </Modal>
  );
}
