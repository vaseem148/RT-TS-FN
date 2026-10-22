'use client';

import { usePathname } from 'next/navigation';
import { RequireRole } from '@/components/dashboard/guard';
import { DashboardShell, type NavItem } from '@/components/dashboard/shell';
import { BOTTOM_TABS } from '@/lib/bottom-tabs';

const NAV: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard', exact: true },
  { label: 'All tickets', href: '/admin/tickets', icon: 'Ticket' },
  { label: 'Shop orders', href: '/admin/orders', icon: 'Package' },
  { label: 'Customers & staff', href: '/admin/users', icon: 'Users' },
  { label: 'Enquiries', href: '/admin/enquiries', icon: 'Inbox' },
  { label: 'My portal', href: '/portal', icon: 'UserRound' },
];

const TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/tickets': 'All tickets',
  '/admin/orders': 'Shop orders',
  '/admin/users': 'Customers & staff',
  '/admin/enquiries': 'Website enquiries',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title =
    TITLES[pathname] ?? (pathname.startsWith('/admin/orders/') ? 'Order details' : 'Ticket details');

  return (
    <RequireRole roles={['admin']}>
      <DashboardShell nav={NAV} bottomNav={BOTTOM_TABS.admin} title={title}>
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
