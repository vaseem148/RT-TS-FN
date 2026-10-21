'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { tabsFor } from '@/lib/bottom-tabs';
import { BottomNav } from './bottom-nav';

/**
 * Phone tab bar for the public site — signed-in users keep their own tabs here
 * too. In the app it stays on large screens as well, since there is no navbar.
 */
export function SiteBottomNav() {
  const { user } = useAuth();

  return <BottomNav id="site" items={tabsFor(user?.role)} className="app:lg:block" />;
}
