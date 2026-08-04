'use client';

import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const CONTROL =
  'w-full rounded-xl border border-line bg-surface-2 px-4 text-sm text-fg placeholder:text-fg-subtle transition-all duration-200 focus:border-brand focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/12 disabled:opacity-60';

interface FieldWrapProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: (id: string) => React.ReactNode;
}

export function Field({ label, hint, error, required, className, children }: FieldWrapProps) {
  const id = useId();
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-[13px] font-semibold text-fg">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      {children(id)}
      {error ? (
        <p className="text-xs font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-fg-subtle">{hint}</p>
      ) : null}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, icon, className, containerClassName, required, type = 'text', ...props },
  ref
) {
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={containerClassName}
    >
      {(id) => (
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-fg-subtle">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            type={isPassword && reveal ? 'text' : type}
            required={required}
            aria-invalid={!!error}
            className={cn(
              CONTROL,
              'h-11',
              icon && 'pl-11',
              isPassword && 'pr-11',
              error && 'border-danger focus:border-danger focus:ring-danger/12',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-fg-subtle transition-colors hover:text-fg"
              aria-label={reveal ? 'Hide password' : 'Show password'}
            >
              {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          )}
        </div>
      )}
    </Field>
  );
});

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, containerClassName, required, rows = 4, ...props },
  ref
) {
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={containerClassName}
    >
      {(id) => (
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          required={required}
          aria-invalid={!!error}
          className={cn(
            CONTROL,
            'resize-y py-3 leading-relaxed',
            error && 'border-danger focus:border-danger focus:ring-danger/12',
            className
          )}
          {...props}
        />
      )}
    </Field>
  );
});

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, className, containerClassName, required, options, placeholder, ...props },
  ref
) {
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={containerClassName}
    >
      {(id) => (
        <select
          ref={ref}
          id={id}
          required={required}
          aria-invalid={!!error}
          className={cn(
            CONTROL,
            'h-11 cursor-pointer appearance-none bg-[length:1.1em] bg-[right_0.85rem_center] bg-no-repeat pr-10',
            "bg-[url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E\")]",
            error && 'border-danger focus:border-danger focus:ring-danger/12',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
});
