'use client';

import { usePathname } from 'next/navigation';
import { RequireRole } from '@/components/dashboard/guard';
import { DashboardShell, type NavItem } from '@/components/dashboard/shell';
import type { BottomNavItem } from '@/components/layout/bottom-nav';

const NAV: NavItem[] = [
  { label: 'Overview', href: '/portal', icon: 'LayoutDashboard', exact: true },
  { label: 'My tickets', href: '/portal/tickets', icon: 'Ticket' },
  { label: 'Raise a ticket', href: '/portal/tickets/new', icon: 'CirclePlus' },
  { label: 'Services', href: '/services', icon: 'Wrench' },
  { label: 'Profile', href: '/portal/profile', icon: 'UserRound' },
];

const BOTTOM_NAV: BottomNavItem[] = [
  { label: 'Home', href: '/portal', icon: 'House', exact: true },
  { label: 'Tickets', href: '/portal/tickets', icon: 'Ticket' },
  { label: 'Raise a ticket', href: '/portal/tickets/new', icon: 'Plus', primary: true },
  { label: 'Services', href: '/services', icon: 'Wrench' },
  { label: 'Profile', href: '/portal/profile', icon: 'UserRound' },
];

const TITLES: Record<string, string> = {
  '/portal': 'Overview',
  '/portal/tickets': 'My tickets',
  '/portal/tickets/new': 'Raise a ticket',
  '/portal/profile': 'My profile',
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? 'Ticket details';

  return (
    <RequireRole roles={['customer', 'admin']}>
      <DashboardShell nav={NAV} bottomNav={BOTTOM_NAV} title={title}>
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
