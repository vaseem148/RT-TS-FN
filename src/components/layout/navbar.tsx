'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LayoutDashboard, Laptop, LogOut, Menu, Package, Phone, Ticket, User, X } from 'lucide-react';
import { site, whatsappLink } from '@/lib/site';
import { cn } from '@/lib/utils';
import { useAuth, homeFor } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/misc';
import { CartButton } from '@/components/shop/shop-buttons';
import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Any navigation closes whatever was open.
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* Announcement strip */}
      <div className="relative z-50 hidden overflow-hidden border-b border-line bg-surface-2/70 text-[12.5px] lg:block app:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-2">
          <p className="flex items-center gap-2 text-fg-muted">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-70" />
              <span className="relative inline-flex size-1.5 rounded-full bg-success" />
            </span>
            <span className="font-semibold text-fg">24/7 emergency service</span>
            <span className="text-fg-subtle">·</span>
            {site.hours}
          </p>
          <div className="flex items-center gap-5 text-fg-muted">
            <a
              href={`tel:${site.primaryPhone}`}
              className="inline-flex items-center gap-1.5 font-semibold transition-colors hover:text-brand"
            >
              <Phone className="size-3.5" />
              {site.phones[0]}
            </a>
            <a
              href={`mailto:${site.email}`}
              className="transition-colors hover:text-brand"
            >
              {site.email}
            </a>
          </div>
        </div>
      </div>

      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300 app:hidden',
          scrolled
            ? 'glass border-b border-line shadow-lg shadow-slate-950/5'
            : 'border-b border-transparent bg-transparent'
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />

          <div className="hidden items-center gap-0.5 lg:flex">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative rounded-lg px-3.5 py-2 text-[13.5px] font-semibold transition-colors',
                  isActive(item.href)
                    ? 'text-brand'
                    : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <CartButton />

            {loading ? (
              <div className="hidden h-9 w-28 animate-pulse rounded-lg bg-surface-2 sm:block" />
            ) : user ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 py-1 pr-2.5 pl-1 transition-colors hover:border-brand/40"
                >
                  <Avatar name={user.name} src={user.avatar} size="sm" />
                  <span className="max-w-24 truncate text-[13px] font-semibold text-fg">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown
                    className={cn(
                      'size-3.5 text-fg-subtle transition-transform',
                      menuOpen && 'rotate-180'
                    )}
                  />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.16 }}
                        className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-surface shadow-2xl"
                      >
                        <div className="border-b border-line p-3.5">
                          <p className="truncate text-sm font-bold text-fg">{user.name}</p>
                          <p className="truncate text-xs text-fg-muted">{user.email || user.phone}</p>
                          <span className="mt-1.5 inline-block rounded-full border border-brand/25 bg-brand-soft px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand uppercase">
                            {user.role}
                          </span>
                        </div>
                        <div className="p-1.5">
                          <Link
                            href={homeFor(user.role)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                          >
                            <LayoutDashboard className="size-4" />
                            Dashboard
                          </Link>
                          {user.role === 'customer' && (
                            <Link
                              href="/portal/tickets"
                              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                            >
                              <Ticket className="size-4" />
                              My tickets
                            </Link>
                          )}
                          {user.role === 'customer' && (
                            <Link
                              href="/portal/devices"
                              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                            >
                              <Laptop className="size-4" />
                              My devices
                            </Link>
                          )}
                          {user.role === 'customer' && (
                            <Link
                              href="/portal/orders"
                              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                            >
                              <Package className="size-4" />
                              My orders
                            </Link>
                          )}
                          {user.role === 'admin' && (
                            <Link
                              href="/admin/orders"
                              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                            >
                              <Package className="size-4" />
                              Shop orders
                            </Link>
                          )}
                          <Link
                            href={`${homeFor(user.role)}/profile`}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                          >
                            <User className="size-4" />
                            Profile
                          </Link>
                          <button
                            onClick={() => void logout()}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger-soft"
                          >
                            <LogOut className="size-4" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Button href="/login" variant="ghost" size="sm">
                  Sign in
                </Button>
                <Button href="/portal/tickets/new" size="sm" className="border-beam">
                  Raise a ticket
                </Button>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(true)}
              className="grid size-9 place-items-center rounded-lg border border-line bg-surface-2 text-fg lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 lg:hidden"
          >
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col border-l border-line bg-surface"
            >
              <div className="flex items-center justify-between border-b border-line p-4">
                <Logo />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="grid size-9 place-items-center rounded-lg border border-line text-fg-muted"
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {user && (
                  <div className="mb-4 flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3">
                    <Avatar name={user.name} src={user.avatar} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-fg">{user.name}</p>
                      <p className="truncate text-xs text-fg-muted">{user.email || user.phone}</p>
                    </div>
                  </div>
                )}

                <nav className="flex flex-col gap-1">
                  {site.nav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'rounded-lg px-3.5 py-2.5 text-[15px] font-semibold transition-colors',
                        isActive(item.href)
                          ? 'bg-brand-soft text-brand'
                          : 'text-fg-muted hover:bg-surface-2'
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                  {user && (
                    <Link
                      href={homeFor(user.role)}
                      className="rounded-lg px-3.5 py-2.5 text-[15px] font-semibold text-fg-muted hover:bg-surface-2"
                    >
                      Dashboard
                    </Link>
                  )}
                </nav>
              </div>

              <div className="flex flex-col gap-2.5 border-t border-line p-4">
                <Button href="/portal/tickets/new" size="lg" className="w-full">
                  <Ticket className="size-4" />
                  Raise a ticket
                </Button>
                {user ? (
                  <Button variant="outline" size="lg" className="w-full" onClick={() => void logout()}>
                    <LogOut className="size-4" />
                    Sign out
                  </Button>
                ) : (
                  <Button href="/login" variant="outline" size="lg" className="w-full">
                    Sign in
                  </Button>
                )}
                <div className="grid grid-cols-2 gap-2.5">
                  <Button href={`tel:${site.primaryPhone}`} variant="secondary" size="md">
                    <Phone className="size-4" />
                    Call
                  </Button>
                  <Button href={whatsappLink()} variant="secondary" size="md">
                    WhatsApp
                  </Button>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
