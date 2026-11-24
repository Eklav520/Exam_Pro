import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';
import { buttonClass, type ButtonSize, type ButtonVariant } from './buttonClass';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export function Button({
  variant,
  size,
  isLoading = false,
  disabled,
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={clsx(buttonClass(variant, size), className)}
      {...rest}
    >
      {isLoading && (
        <span
          aria-hidden
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
