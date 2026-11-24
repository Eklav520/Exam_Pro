import clsx from 'clsx';
import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  /** Id of the heading that names the dialog. */
  titleId: string;
  onClose: () => void;
  className?: string;
  children: ReactNode;
}

export function Modal({ open, titleId, onClose, className, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={clsx(
        'm-auto w-full max-w-md rounded-xl bg-surface p-6 text-ink shadow-xl backdrop:bg-ink/40',
        className,
      )}
    >
      {children}
    </dialog>
  );
}
