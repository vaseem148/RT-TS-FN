import type { BottomNavItem } from '@/components/layout/bottom-nav';

/**
 * Phone tab bars. Each role keeps the same tabs everywhere — including on the
 * public pages it can reach (e.g. /services) — so the app never "switches".
 */
export const BOTTOM_TABS = {
  guest: [
    { label: 'Home', href: '/', icon: 'House', exact: true },
    { label: 'Services', href: '/services', icon: 'Wrench' },
    { label: 'Raise a ticket', shortLabel: 'Raise', href: '/portal/tickets/new', icon: 'Plus', primary: true },
    { label: 'Track', href: '/track', icon: 'Search' },
    { label: 'Sign in', href: '/login', icon: 'UserRound' },
  ],
  customer: [
    { label: 'Home', href: '/portal', icon: 'House', exact: true },
    { label: 'Tickets', href: '/portal/tickets', icon: 'Ticket' },
    { label: 'Raise a ticket', shortLabel: 'Raise', href: '/portal/tickets/new', icon: 'Plus', primary: true },
    { label: 'Services', href: '/services', icon: 'Wrench' },
    { label: 'Profile', href: '/portal/profile', icon: 'UserRound' },
  ],
  /**
   * In the app a customer's Home is the app home screen, not the portal overview,
   * and Track keeps its tab (services are on Home and in the menu).
   */
  customerApp: [
    { label: 'Home', href: '/', icon: 'House', exact: true },
    { label: 'Tickets', href: '/portal/tickets', icon: 'Ticket' },
    { label: 'Raise a ticket', shortLabel: 'Raise', href: '/portal/tickets/new', icon: 'Plus', primary: true },
    { label: 'Track', href: '/track', icon: 'Search' },
    { label: 'Account', href: '/portal/profile', icon: 'UserRound' },
  ],
  technician: [
    { label: 'My day', href: '/tech', icon: 'LayoutDashboard', exact: true },
    { label: 'Tickets', href: '/tech/tickets', icon: 'Ticket' },
    { label: 'Profile', href: '/tech/profile', icon: 'UserRound' },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard', exact: true },
    { label: 'Tickets', href: '/admin/tickets', icon: 'Ticket' },
    { label: 'Users', href: '/admin/users', icon: 'Users' },
    { label: 'Enquiries', href: '/admin/enquiries', icon: 'Inbox' },
  ],
} satisfies Record<string, BottomNavItem[]>;

export function tabsFor(role?: string, isApp = false): BottomNavItem[] {
  if (role === 'admin') return BOTTOM_TABS.admin;
  if (role === 'technician') return BOTTOM_TABS.technician;
  if (role === 'customer') return isApp ? BOTTOM_TABS.customerApp : BOTTOM_TABS.customer;
  return BOTTOM_TABS.guest;
}
