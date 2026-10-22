'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { useIsApp } from '@/lib/app-mode';
import { tabsFor } from '@/lib/bottom-tabs';
import { BottomNav } from './bottom-nav';

/**
 * Phone tab bar for the public site — signed-in users keep their own tabs here
 * too. In the app it stays on large screens as well, since there is no navbar,
 * and gives way to the booking bar on a service page.
 */
export function SiteBottomNav() {
  const { user, loading } = useAuth();
  const isApp = useIsApp();
  const pathname = usePathname();
  const isServicePage = /^\/services\/[^/]+$/.test(pathname);

  // Signed out, the app only shows its welcome and legal pages (see AppGate) — no tabs.
  if (isApp && !loading && !user) return null;

  return (
    <BottomNav
      id="site"
      items={tabsFor(user?.role, isApp)}
      className={isServicePage ? 'app:hidden' : 'app:lg:block'}
    />
  );
}
