'use client';

import { usePathname } from 'next/navigation';
import { RequireRole } from '@/components/dashboard/guard';
import { DashboardShell, type NavItem } from '@/components/dashboard/shell';

const NAV: NavItem[] = [
  { label: 'My day', href: '/tech', icon: 'LayoutDashboard', exact: true },
  { label: 'My tickets', href: '/tech/tickets', icon: 'Ticket' },
  { label: 'Profile', href: '/tech/profile', icon: 'UserRound' },
];

const TITLES: Record<string, string> = {
  '/tech': 'My day',
  '/tech/tickets': 'My tickets',
  '/tech/profile': 'My profile',
};

export default function TechLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? 'Ticket details';

  return (
    <RequireRole roles={['technician', 'admin']}>
      <DashboardShell nav={NAV} title={title}>
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
