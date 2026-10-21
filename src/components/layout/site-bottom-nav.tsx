'use client';

import { homeFor, useAuth } from '@/components/providers/auth-provider';
import { BottomNav } from './bottom-nav';

/** Phone tab bar for the public site; "Account" leads to the user's own area. */
export function SiteBottomNav() {
  const { user } = useAuth();

  return (
    <BottomNav
      id="site"
      items={[
        { label: 'Home', href: '/', icon: 'House', exact: true },
        { label: 'Services', href: '/services', icon: 'Wrench' },
        { label: 'Raise a ticket', href: '/portal/tickets/new', icon: 'Plus', primary: true },
        { label: 'Track', href: '/track', icon: 'Search' },
        { label: user ? 'Account' : 'Sign in', href: user ? homeFor(user.role) : '/login', icon: 'UserRound' },
      ]}
    />
  );
}
