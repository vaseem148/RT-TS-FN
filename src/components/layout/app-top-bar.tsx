'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useIsApp } from '@/lib/app-mode';
import { tabsFor } from '@/lib/bottom-tabs';
import { ThemeToggle } from './theme-toggle';

// A service page shows its name large in its own header, so the bar stays empty.
const TITLES: [prefix: string, title: string][] = [
  ['/services/', ''],
  ['/services', 'Services'],
  ['/products', 'Products'],
  ['/track', 'Track ticket'],
  ['/about', 'About us'],
  ['/contact', 'Contact'],
  ['/privacy', 'Privacy policy'],
  ['/terms', 'Terms of service'],
];

/** Goes back in history, or to the parent path when the page was opened directly. */
export function useGoBack() {
  const router = useRouter();
  const pathname = usePathname();

  return () => {
    if (window.history.length > 1) router.back();
    else router.push(pathname.split('/').slice(0, -1).join('/') || '/');
  };
}

/**
 * Purple header for the public pages inside the Android app (replaces the
 * website navbar there): a back button on inner pages, the page title and the
 * theme toggle. The home screen draws its own header.
 */
export function AppTopBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isApp = useIsApp();
  const goBack = useGoBack();

  if (pathname === '/') return null;

  const isTab = tabsFor(user?.role, isApp).some((tab) => tab.href === pathname);
  const title = TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? '';

  return (
    <header className="app-hero sticky top-0 z-50 hidden pt-(--safe-top) app:block">
      <div className="flex h-14 items-center gap-1.5 px-3">
        {!isTab && (
          <button
            type="button"
            onClick={goBack}
            aria-label="Go back"
            className="grid size-10 shrink-0 place-items-center rounded-full text-fg transition-transform active:scale-90 active:bg-surface-2"
          >
            <ChevronLeft className="size-6" />
          </button>
        )}

        <p key={pathname} className="page-enter min-w-0 flex-1 truncate px-1.5 text-[17px] font-bold tracking-tight text-fg">
          {title}
        </p>

        <ThemeToggle className="rounded-full" />
      </div>
    </header>
  );
}
