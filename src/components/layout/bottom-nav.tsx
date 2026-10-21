'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsApp } from '@/lib/app-mode';
import { Icon } from '@/components/ui/misc';

export interface BottomNavItem {
  label: string;
  href: string;
  icon: string;
  /** Match only on the exact path — for section index pages. */
  exact?: boolean;
  /** Rendered as the raised round action in the middle of the bar. */
  primary?: boolean;
  /** Tab label in the app, where the primary action is a regular tab. */
  shortLabel?: string;
}

/**
 * App-style tab bar for phones (the website doubles as the Android app).
 * Hidden on large screens, where the sidebar / top navbar take over. On the
 * website it floats as a pill with a raised primary action; in the app it is
 * a flat, full-width bar.
 */
export function BottomNav({
  items,
  id,
  className,
}: {
  items: BottomNavItem[];
  id: string;
  className?: string;
}) {
  const pathname = usePathname();
  const isApp = useIsApp();

  // The most specific match wins, so /portal/tickets/new lights up "Raise"
  // rather than "Tickets".
  const active = items
    .filter((item) =>
      item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
    )
    .sort((a, b) => b.href.length - a.href.length)[0];

  const tab = (item: BottomNavItem, extraClass?: string) => {
    const isActive = active?.href === item.href;

    return (
      <Link
        key={`tab-${item.href}`}
        href={item.href}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'relative isolate flex h-full flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-[10.5px] font-semibold transition-colors active:scale-95',
          isActive ? 'text-brand' : 'text-fg-subtle',
          extraClass
        )}
      >
        {/* The primary tab is hidden on the website; it must not own the shared
            highlight there, or the highlight would fly in from nowhere. */}
        {isActive && (!item.primary || isApp) && (
          <motion.span
            layoutId={`bottom-nav-${id}`}
            className="absolute inset-x-1.5 inset-y-1.5 -z-10 rounded-2xl bg-brand-soft app:inset-x-5 app:top-0 app:bottom-auto app:h-[3px] app:rounded-full app:bg-brand"
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          />
        )}
        <Icon
          name={item.icon}
          className={cn('size-[21px] transition-transform duration-300', isActive && '-translate-y-0.5 scale-110')}
        />
        <span className="leading-none">{item.shortLabel ?? item.label}</span>
      </Link>
    );
  };

  return (
    <nav
      aria-label="Primary"
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden',
        'app:border-t app:border-line app:bg-surface app:px-0 app:pb-(--safe-bottom)',
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-md items-center rounded-3xl border border-line bg-surface/95 px-1.5 shadow-2xl shadow-black/30 backdrop-blur-xl app:max-w-lg app:rounded-none app:border-0 app:bg-transparent app:shadow-none app:backdrop-blur-none">
        {items.map((item) => {
          if (!item.primary) return tab(item);

          return [
            <div key={`raised-${item.href}`} className="flex flex-1 justify-center app:hidden">
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={active?.href === item.href ? 'page' : undefined}
                className="-mt-9 grid size-15 place-items-center rounded-full bg-linear-135 from-brand to-accent text-white shadow-lg shadow-brand/40 ring-4 ring-bg transition-transform duration-200 active:scale-90"
              >
                <Icon name={item.icon} className="size-7" />
              </Link>
            </div>,
            tab(item, 'hidden app:flex'),
          ];
        })}
      </div>
    </nav>
  );
}
