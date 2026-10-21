'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ExternalLink, Info, LogOut, Mail, Menu, Package, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';
import { useGoBack } from '@/components/layout/app-top-bar';
import { BottomNav, type BottomNavItem } from '@/components/layout/bottom-nav';
import { Logo } from '@/components/layout/logo';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Avatar, Icon } from '@/components/ui/misc';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  /** Match only on exact path — used for dashboard index links. */
  exact?: boolean;
}

/** Public pages the app has no navbar for — listed in the drawer instead. */
const EXPLORE = [
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Track a ticket', href: '/track', icon: Search },
  { label: 'About us', href: '/about', icon: Info },
  { label: 'Contact', href: '/contact', icon: Mail },
];

export function DashboardShell({
  nav,
  bottomNav,
  title,
  children,
}: {
  nav: NavItem[];
  /** Phone tab bar; the full `nav` stays in the drawer. */
  bottomNav?: BottomNavItem[];
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const goBack = useGoBack();

  useEffect(() => setOpen(false), [pathname]);

  // Inner pages (e.g. a ticket) get a back button in the app instead of the menu.
  const isInner = ![...nav, ...(bottomNav ?? [])].some((item) => item.href === pathname);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const navList = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold transition-all active:scale-[0.98]',
            isActive(item)
              ? 'bg-brand-soft text-brand shadow-sm'
              : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
          )}
        >
          <Icon
            name={item.icon}
            className={cn(
              'size-[18px] shrink-0 transition-transform group-hover:scale-110',
              isActive(item) ? 'text-brand' : 'text-fg-subtle'
            )}
          />
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <span className="rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-line p-3">
      <div className="flex items-center gap-2.5 rounded-xl bg-surface-2 p-2.5">
        <Avatar name={user?.name} src={user?.avatar} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-fg">{user?.name}</p>
          <p className="truncate text-[11px] text-fg-subtle capitalize">{user?.role}</p>
        </div>
        <button
          onClick={() => void logout()}
          className="rounded-lg p-1.5 text-fg-subtle transition-colors hover:bg-danger-soft hover:text-danger"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="size-4" />
        </button>
      </div>
      <div className="mt-2 hidden app:block">
        {EXPLORE.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-fg-muted active:bg-surface-2"
          >
            <item.icon className="size-4 text-fg-subtle" />
            {item.label}
          </Link>
        ))}
      </div>
      <Link
        href="/"
        className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-medium text-fg-subtle transition-colors hover:text-brand app:hidden"
      >
        <ExternalLink className="size-3.5" />
        View public website
      </Link>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-bg-subtle">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <div className="border-b border-line p-4">
          <Logo />
        </div>
        {navList}
        {footer}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 lg:hidden"
          >
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-line bg-surface pt-(--safe-top) pb-(--safe-bottom)"
            >
              <div className="flex items-center justify-between border-b border-line p-4">
                <Logo />
                <button
                  onClick={() => setOpen(false)}
                  className="grid size-9 place-items-center rounded-lg border border-line text-fg-muted"
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>
              {navList}
              {footer}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="app-hero glass sticky top-0 z-40 flex h-15 items-center gap-3 border-b border-line px-4 sm:px-6 app:h-[calc(3.75rem+var(--safe-top))] app:border-b-0 app:pt-(--safe-top)">
          {isInner && (
            <button
              onClick={goBack}
              className="-ml-1.5 hidden size-10 place-items-center rounded-full text-fg transition-transform active:scale-90 active:bg-surface-2 app:grid"
              aria-label="Go back"
            >
              <ChevronLeft className="size-6" />
            </button>
          )}
          <button
            onClick={() => setOpen(true)}
            className={cn(
              'grid size-9 place-items-center rounded-lg border border-line bg-surface text-fg lg:hidden',
              isInner && 'app:hidden'
            )}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <h1 className="flex-1 truncate text-[15px] font-bold text-fg">{title}</h1>
          <ThemeToggle />
        </header>

        <main className={cn('flex-1 p-4 sm:p-6', bottomNav && 'pb-28 lg:pb-6')}>{children}</main>
      </div>

      {bottomNav && <BottomNav items={bottomNav} id="dashboard" />}
    </div>
  );
}
