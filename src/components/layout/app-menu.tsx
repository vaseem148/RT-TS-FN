'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FileText,
  House,
  Info,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Package,
  Phone,
  Search,
  ShieldCheck,
  Ticket,
  UserRound,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';
import { site, whatsappLink } from '@/lib/site';
import { cn } from '@/lib/utils';
import { homeFor, useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/misc';
import { APP_CUSTOMER_LINKS } from './app-links';
import { Logo } from './logo';

// The website's menu, one icon each.
const NAV_ICONS: Record<string, LucideIcon> = {
  '/': House,
  '/services': Wrench,
  '/products': Package,
  '/track': Search,
  '/about': Info,
  '/contact': Mail,
};

/**
 * The app's full menu: everything the website's navbar and mobile drawer
 * offer — pages, account, raise a ticket, call / WhatsApp — behind one button,
 * so the app never lacks an option the website has.
 */
export function AppMenu({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open) return;
    // Escape — and Android's Back button, which sends one — closes the menu.
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const home = user ? homeFor(user.role) : null;

  const accountLinks = user
    ? [
        { label: 'My dashboard', href: home!, icon: LayoutDashboard },
        ...(user.role === 'customer' ? APP_CUSTOMER_LINKS : []),
        ...(user.role === 'admin' ? [{ label: 'Shop orders', href: '/admin/orders', icon: Package }] : []),
        { label: 'My profile', href: `${home}/profile`, icon: UserRound },
      ]
    : [];

  const drawer = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100"
        >
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col rounded-l-3xl bg-surface pt-(--safe-top) pb-(--safe-bottom) shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid size-9 place-items-center rounded-full border border-line text-fg-muted active:scale-90"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="stagger flex-1 space-y-5 overflow-y-auto p-4">
              {user && (
                <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2 p-3">
                  <Avatar name={user.name} src={user.avatar} />
                  <div className="min-w-0">
                    <p className="truncate text-[14.5px] font-bold text-fg">{user.name}</p>
                    <p className="truncate text-[12.5px] text-fg-muted">{user.email || user.phone}</p>
                  </div>
                </div>
              )}

              <nav aria-label="Pages" className="flex flex-col gap-1">
                {site.nav.map((item) => {
                  const ItemIcon = NAV_ICONS[item.href] ?? House;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] font-semibold transition-colors active:scale-[0.98]',
                        isActive(item.href) ? 'bg-brand-soft text-brand' : 'text-fg hover:bg-surface-2'
                      )}
                    >
                      <ItemIcon className={cn('size-[18px]', isActive(item.href) ? 'text-brand' : 'text-accent')} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {accountLinks.length > 0 && (
                <nav aria-label="Account" className="flex flex-col gap-1 border-t border-line pt-4">
                  {accountLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] font-semibold transition-colors active:scale-[0.98]',
                        pathname === item.href ? 'bg-brand-soft text-brand' : 'text-fg hover:bg-surface-2'
                      )}
                    >
                      <item.icon className="size-[18px] text-accent" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={`tel:${site.primaryPhone}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 py-3 text-[14px] font-bold text-fg active:scale-[0.97]"
                >
                  <Phone className="size-4 text-success" />
                  Call us
                </a>
                <a
                  href={whatsappLink()}
                  className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 py-3 text-[14px] font-bold text-fg active:scale-[0.97]"
                >
                  <MessageCircle className="size-4 text-success" />
                  WhatsApp
                </a>
              </div>

              <div className="space-y-1 text-[12.5px] text-fg-subtle">
                <p>{site.emergency} · {site.phones[0]}</p>
                <p>{site.hours}</p>
                <p>{site.email}</p>
                <p className="flex gap-3 pt-1">
                  <Link href="/privacy" className="inline-flex items-center gap-1 font-semibold text-fg-muted">
                    <ShieldCheck className="size-3.5" /> Privacy
                  </Link>
                  <Link href="/terms" className="inline-flex items-center gap-1 font-semibold text-fg-muted">
                    <FileText className="size-3.5" /> Terms
                  </Link>
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 border-t border-line p-4">
              <Button href="/portal/tickets/new" size="lg" className="w-full rounded-2xl">
                <Ticket className="size-4" />
                Raise a ticket
              </Button>
              {user ? (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-2xl border-danger/40 text-danger hover:border-danger hover:bg-danger-soft hover:text-danger"
                  onClick={() => void logout()}
                >
                  <LogOut className="size-4" />
                  Sign out
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <Button href="/login" variant="outline" size="lg" className="rounded-2xl">
                    Sign in
                  </Button>
                  <Button href="/register" variant="secondary" size="lg" className="rounded-2xl">
                    Create account
                  </Button>
                </div>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className={cn(
          'grid size-9 place-items-center rounded-full border border-line bg-surface-2 text-fg transition-transform active:scale-90',
          className
        )}
      >
        <Menu className="size-[18px]" />
      </button>
      {/* Portalled: the page transition animates a transform, which would trap a fixed drawer. */}
      {mounted && createPortal(drawer, document.body)}
    </>
  );
}
