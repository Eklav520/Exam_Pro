import { useId, type ReactNode } from 'react';

interface FieldProps {
  label: string;
  error?: string | undefined;
  hint?: string;
  required?: boolean;
  children: (props: {
    id: string;
    className: string;
    'aria-invalid': boolean;
    'aria-required': boolean | undefined;
    'aria-describedby': string | undefined;
  }) => ReactNode;
}

/** Wires a label, hint and error to any control accessibly. */
export function Field({ label, error, hint, required = false, children }: FieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? hint;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children({
        id,
        className: 'control',
        'aria-invalid': Boolean(error),
        'aria-required': required || undefined,
        'aria-describedby': message ? messageId : undefined,
      })}
      {message && (
        <p id={messageId} className={error ? 'text-sm text-danger' : 'text-sm text-muted'}>
          {message}
        </p>
      )}
    </div>
  );
}
