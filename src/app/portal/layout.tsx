'use client';

import { usePathname } from 'next/navigation';
import { RequireRole } from '@/components/dashboard/guard';
import { DashboardShell, type NavItem } from '@/components/dashboard/shell';
import { useIsApp } from '@/lib/app-mode';
import { BOTTOM_TABS } from '@/lib/bottom-tabs';

const NAV: NavItem[] = [
  { label: 'Overview', href: '/portal', icon: 'LayoutDashboard', exact: true },
  { label: 'My tickets', href: '/portal/tickets', icon: 'Ticket' },
  { label: 'Raise a ticket', href: '/portal/tickets/new', icon: 'CirclePlus' },
  { label: 'My devices', href: '/portal/devices', icon: 'Laptop' },
  { label: 'My orders', href: '/portal/orders', icon: 'Package' },
  { label: 'Shop', href: '/products', icon: 'ShoppingBag' },
  { label: 'Services', href: '/services', icon: 'Wrench' },
  { label: 'Profile', href: '/portal/profile', icon: 'UserRound' },
];

const TITLES: Record<string, string> = {
  '/portal': 'Overview',
  '/portal/tickets': 'My tickets',
  '/portal/tickets/new': 'Raise a ticket',
  '/portal/profile': 'My profile',
  '/portal/devices': 'My devices',
  '/portal/devices/new': 'Add a device',
  '/portal/orders': 'My orders',
};

/** Detail pages: the title follows the section. */
function detailTitle(pathname: string) {
  if (pathname.startsWith('/portal/devices/')) return 'Device';
  if (pathname.startsWith('/portal/orders/')) return 'Order details';
  return 'Ticket details';
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? detailTitle(pathname);
  const isApp = useIsApp();

  return (
    <RequireRole roles={['customer', 'admin']}>
      <DashboardShell nav={NAV} bottomNav={isApp ? BOTTOM_TABS.customerApp : BOTTOM_TABS.customer} title={title}>
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
