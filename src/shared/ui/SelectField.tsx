import clsx from 'clsx';
import { useId } from 'react';

interface SelectFieldProps {
  label: string;
  value: string;
  options: readonly (string | { value: string; label: string })[];
  onChange: (value: string) => void;
  className?: string;
}

export function SelectField({ label, value, options, onChange, className }: SelectFieldProps) {
  const id = useId();
  return (
    <div className={clsx('min-w-36', className)}>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-ink">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="control"
      >
        {options.map((option) => {
          const item = typeof option === 'string' ? { value: option, label: option } : option;
          return (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          );
        })}
      </select>
    </div>
  );
}
