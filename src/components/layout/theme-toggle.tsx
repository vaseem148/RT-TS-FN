'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={mounted ? `Switch to ${isDark ? 'light' : 'dark'} mode` : 'Toggle theme'}
      className={cn(
        'relative grid size-9 place-items-center rounded-lg border border-line bg-surface-2 text-fg-muted transition-all duration-200 hover:border-brand/45 hover:text-brand',
        className
      )}
    >
      {/* Rendered only after mount so the icon matches the resolved theme. */}
      {mounted &&
        (isDark ? (
          <Sun className="size-[17px] transition-transform duration-300" />
        ) : (
          <Moon className="size-[17px] transition-transform duration-300" />
        ))}
    </button>
  );
}
