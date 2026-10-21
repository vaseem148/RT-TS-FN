'use client';

import { usePathname } from 'next/navigation';
import { RequireRole } from '@/components/dashboard/guard';
import { DashboardShell, type NavItem } from '@/components/dashboard/shell';
import type { BottomNavItem } from '@/components/layout/bottom-nav';

const NAV: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard', exact: true },
  { label: 'All tickets', href: '/admin/tickets', icon: 'Ticket' },
  { label: 'Customers & staff', href: '/admin/users', icon: 'Users' },
  { label: 'Enquiries', href: '/admin/enquiries', icon: 'Inbox' },
  { label: 'My portal', href: '/portal', icon: 'UserRound' },
];

const BOTTOM_NAV: BottomNavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard', exact: true },
  { label: 'Tickets', href: '/admin/tickets', icon: 'Ticket' },
  { label: 'Users', href: '/admin/users', icon: 'Users' },
  { label: 'Enquiries', href: '/admin/enquiries', icon: 'Inbox' },
];

const TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/tickets': 'All tickets',
  '/admin/users': 'Customers & staff',
  '/admin/enquiries': 'Website enquiries',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? 'Ticket details';

  return (
    <RequireRole roles={['admin']}>
      <DashboardShell nav={NAV} bottomNav={BOTTOM_NAV} title={title}>
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
