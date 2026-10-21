'use client';

import { motion } from 'framer-motion';
import { Mail, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AuthMethod = 'phone' | 'email';

const OPTIONS = [
  { value: 'phone', label: 'Mobile number', icon: Smartphone },
  { value: 'email', label: 'Email', icon: Mail },
] as const;

/** Sign in or sign up with a mobile number or an email address. */
export function AuthMethodToggle({
  value,
  onChange,
  id,
}: {
  value: AuthMethod;
  onChange: (method: AuthMethod) => void;
  /** Keeps the sliding highlight separate per form. */
  id: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Continue with"
      className="grid grid-cols-2 gap-1 rounded-2xl border border-line bg-surface-2 p-1"
    >
      {OPTIONS.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative isolate flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13.5px] font-semibold transition-colors active:scale-[0.97]',
              active ? 'text-fg' : 'text-fg-muted hover:text-fg'
            )}
          >
            {active && (
              <motion.span
                layoutId={`auth-method-${id}`}
                className="absolute inset-0 -z-10 rounded-xl bg-surface shadow-sm"
                transition={{ type: 'spring', damping: 28, stiffness: 340 }}
              />
            )}
            <option.icon className={cn('size-4', active && 'text-brand')} />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
