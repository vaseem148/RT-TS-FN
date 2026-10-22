'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ChevronRight,
  Laptop,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Ticket,
  Truck,
  Wrench,
  X,
} from 'lucide-react';
import { site, whatsappLink } from '@/lib/site';
import { deviceApi, orderApi, productApi, serviceApi, ticketApi } from '@/lib/endpoints';
import { useApi } from '@/lib/use-api';
import { useIsApp } from '@/lib/app-mode';
import { formatCurrency } from '@/lib/utils';
import { deviceMeta, deviceTitle } from '@/lib/device-meta';
import { homeFor, useAuth } from '@/components/providers/auth-provider';
import { ART_TINTS, ArtTile, ServiceArt, artForProduct, artForService } from '@/components/app/service-art';
import { APP_MORE_LINKS } from '@/components/layout/app-links';
import { AppMenu } from '@/components/layout/app-menu';
import { Logo } from '@/components/layout/logo';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { TicketCard } from '@/components/tickets/ticket-list';
import { AddToCart, CartButton } from '@/components/shop/shop-buttons';
import { OrderStatusBadge } from '@/components/shop/order-ui';
import { Button } from '@/components/ui/button';
import { Skeleton, Spinner } from '@/components/ui/misc';

const TICKET_NUMBER = /^RW-?\d/i;

// "More support" cards — the website's Raise a ticket button and its floating Call / WhatsApp.
const SUPPORT = [
  {
    label: 'Raise a ticket',
    sub: 'Engineer at your door',
    href: '/portal/tickets/new',
    icon: Ticket,
    bg: '#EAE4FF',
    chip: '#4C1D95',
    ink: '#4C1D95',
  },
  {
    label: 'Call us 24/7',
    sub: 'Emergency line',
    href: `tel:${site.primaryPhone}`,
    icon: Phone,
    bg: '#DCEBFF',
    chip: '#1849A9',
    ink: '#1849A9',
  },
  {
    label: 'WhatsApp',
    sub: 'Chat with our team',
    href: whatsappLink(),
    icon: MessageCircle,
    bg: '#DDF4E8',
    chip: '#1F7A4D',
    ink: '#14532D',
  },
];

// The three things people come for, big at the top: get something fixed,
// book a service, or buy.
const QUICK = [
  {
    label: 'Repair',
    sub: 'Fix it at your door',
    href: '/portal/tickets/new',
    icon: Wrench,
    from: '#E2187D',
    to: '#B5125F',
    glow: 'rgba(226,24,125,0.32)',
    float: 'rw-f1',
  },
  {
    label: 'Service',
    sub: 'All services',
    href: '/services',
    icon: ShieldCheck,
    from: '#6D4BE0',
    to: '#4B35A8',
    glow: 'rgba(75,53,168,0.32)',
    float: 'rw-f2',
  },
  {
    label: 'Sales',
    sub: 'Buy computers',
    href: '/products',
    icon: ShoppingBag,
    from: '#FFB020',
    to: '#F08A00',
    glow: 'rgba(240,138,0,0.32)',
    float: 'rw-f3',
  },
];

function SectionTitle({ title, href, action = 'See all' }: { title: string; href?: string; action?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="text-[19px] font-extrabold tracking-tight text-fg">{title}</h2>
      {href && (
        <Link href={href} className="shrink-0 text-[14px] font-bold text-accent">
          {action}
        </Link>
      )}
    </div>
  );
}

/**
 * Home screen of the Android app (the website keeps its marketing home page),
 * laid out like the app design prototype: header, search, ticket tracking,
 * service categories, support, shop and offers — and, for customers, their
 * tickets. Staff skip it and land on their own dashboards.
 */
export function AppHome() {
  const isApp = useIsApp();
  const router = useRouter();
  const { user, stats, loading } = useAuth();
  const [query, setQuery] = useState('');
  const [ticketNo, setTicketNo] = useState('');

  const isCustomer = user?.role === 'customer';
  const { data: services } = useApi('services', () => serviceApi.list(), { ttl: 300_000 });
  const { data: shop } = useApi('products:app-home', () => productApi.list({ limit: 8 }), {
    ttl: 300_000,
  });
  const { data: recent } = useApi(isApp && isCustomer ? 'tickets:app-home' : null, () =>
    ticketApi.list({ limit: 3, sort: '-createdAt' })
  );
  const { data: devices } = useApi(isApp && isCustomer ? 'devices:list:' : null, () => deviceApi.list());
  const { data: activeOrders } = useApi(isApp && isCustomer ? 'orders:app-home' : null, () =>
    orderApi.list({ status: 'active', limit: 2 })
  );

  useEffect(() => {
    if (isApp && user && user.role !== 'customer') router.replace(homeFor(user.role));
  }, [isApp, user, router]);

  const term = query.trim();
  const matches = useMemo(() => {
    if (!services || !term) return services;
    const needle = term.toLowerCase();
    return services.filter((service) =>
      [service.title, service.shortDescription, ...service.features].join(' ').toLowerCase().includes(needle)
    );
  }, [services, term]);

  const search = (event: React.FormEvent) => {
    event.preventDefault();
    if (TICKET_NUMBER.test(term)) router.push(`/track?t=${encodeURIComponent(term.toUpperCase())}`);
    else if (matches?.length === 1) router.push(`/services/${matches[0].slug}`);
  };

  const track = (event: React.FormEvent) => {
    event.preventDefault();
    const value = ticketNo.trim().toUpperCase();
    router.push(value ? `/track?t=${encodeURIComponent(value)}` : '/track');
  };

  if (loading || (user && !isCustomer)) {
    return (
      <div className="grid min-h-[70dvh] place-items-center">
        <Spinner />
      </div>
    );
  }

  const searching = term.length > 0;
  const tiles = matches;
  const amc = services?.find((service) => service.ticketCategory === 'amc');
  const popular = services?.filter((service) => service.isFeatured) ?? [];
  const products = shop?.products ?? [];

  return (
    <div className="pb-8">
      {/* Header */}
      <section className="app-hero relative isolate overflow-hidden px-4 pt-[calc(var(--safe-top)+1rem)] pb-[4.4rem]">
        <span
          className="rw-aur1 absolute -top-24 -right-24 -z-10 size-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(226,24,125,0.38) 0%, rgba(226,24,125,0) 70%)' }}
          aria-hidden
        />
        <span
          className="rw-aur2 absolute -bottom-28 -left-20 -z-10 size-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(123,97,255,0.6) 0%, rgba(123,97,255,0) 70%)' }}
          aria-hidden
        />

        <div className="flex items-center justify-between gap-3">
          <Logo />
          <div className="flex items-center gap-2">
            <CartButton className="size-10 rounded-full border-0 bg-white/15 text-fg" />
            <ThemeToggle className="size-10 rounded-full border-0 bg-white/15" />
            <AppMenu className="size-10 border-0 bg-white/15" />
          </div>
        </div>

        <p className="mt-4 flex items-center gap-1.5 text-[13px] font-bold">
          <MapPin className="size-4 text-[#FF8FC4]" />
          Chennai · Vellore
          <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-fg-muted">
            <span className="rw-pulse size-[7px] rounded-full bg-[#34D399]" />
            24/7 emergency
          </span>
        </p>

        <h1 className="mt-2.5 text-[1.45rem] leading-tight font-extrabold tracking-tight">
          {isCustomer ? `Hi ${user.name.split(' ')[0]} 👋` : 'IT support at your doorstep'}
        </h1>
        <p className="mt-1 text-[12.5px] text-fg-muted">
          {isCustomer
            ? 'What can we fix for you today?'
            : 'Free diagnosis · 30-day warranty · on-site, carry-in or pickup'}
        </p>
      </section>

      <div className="relative z-10 mx-4 -mt-[3.2rem]">
        {/* Search: filters the services below, or tracks a ticket number */}
        <form
          onSubmit={search}
          className="flex h-[52px] items-center gap-2.5 rounded-[14px] bg-surface pr-2 pl-4 shadow-[0_8px_24px_rgba(36,26,94,0.14)]"
        >
          <Search className="size-[18px] shrink-0 text-fg-subtle" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search laptop repair, CCTV, ticket no…"
            aria-label="Search services or track a ticket"
            enterKeyHint="search"
            className="h-full min-w-0 flex-1 bg-transparent text-[14.5px] text-fg outline-none placeholder:text-fg-subtle"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="grid size-8 place-items-center rounded-full text-fg-subtle active:bg-surface-2"
            >
              <X className="size-4" />
            </button>
          )}
        </form>

        {/* Repair · Service · Sales */}
        {!searching && (
          <div className="stagger mt-4 grid grid-cols-3 gap-2.5">
            {QUICK.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="relative isolate flex flex-col gap-2 overflow-hidden rounded-[18px] p-3 text-white transition-transform active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${item.from}, ${item.to})`,
                  boxShadow: `0 10px 22px ${item.glow}`,
                }}
              >
                <span className="absolute -right-6 -bottom-8 -z-10 size-20 rounded-full bg-white/14" aria-hidden />
                <span className={`grid size-10 place-items-center rounded-xl bg-white/20 ${item.float}`}>
                  <item.icon className="size-[22px]" />
                </span>
                <span className="text-[16px] leading-none font-extrabold">{item.label}</span>
                <span className="-mt-1 text-[11px] leading-tight text-white/85">{item.sub}</span>
              </Link>
            ))}
          </div>
        )}

        <div className="stagger mt-[22px] space-y-[26px]">
          {TICKET_NUMBER.test(term) && (
            <Link
              href={`/track?t=${encodeURIComponent(term.toUpperCase())}`}
              className="flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand-soft p-4 text-brand transition-transform active:scale-[0.98]"
            >
              <Search className="size-5 shrink-0" />
              <span className="flex-1 text-[14px] font-bold">Track ticket {term.toUpperCase()}</span>
              <ArrowRight className="size-4" />
            </Link>
          )}

          {/* Track your repair */}
          <form
            onSubmit={track}
            className="relative isolate overflow-hidden rounded-[20px] bg-linear-135 from-[#241A5E] to-[#4B35A8] p-4 text-white shadow-[0_12px_28px_rgba(36,26,94,0.28)]"
          >
            <span
              className="rw-aur3 absolute -top-14 -right-12 -z-10 size-44 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(255,176,32,0.3) 0%, rgba(255,176,32,0) 70%)' }}
              aria-hidden
            />
            <div className="flex items-center justify-between gap-3">
              <span className="flex flex-col gap-0.5">
                <span className="text-[11px] font-extrabold tracking-[0.08em] text-[#C7D2FE] uppercase">
                  Track your repair
                </span>
                <span className="text-[16px] font-extrabold">Where is my ticket?</span>
              </span>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/12">
                <ShieldCheck className="size-[22px]" />
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <label className="flex h-[46px] min-w-0 flex-1 items-center rounded-xl bg-white px-3">
                <span className="sr-only">Ticket number</span>
                <input
                  value={ticketNo}
                  onChange={(event) => setTicketNo(event.target.value)}
                  placeholder="RW-2026-0001"
                  className="w-full min-w-0 bg-transparent text-[14px] font-semibold tracking-[0.03em] text-[#241A5E] uppercase outline-none placeholder:text-[#9A98B5]"
                />
              </label>
              <button
                type="submit"
                className="h-[46px] shrink-0 rounded-xl bg-[#FFB020] px-4 text-[14px] font-extrabold text-[#241A5E] transition-transform active:scale-95"
              >
                Track
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-snug text-[#C7D2FE]">
              Your ticket number came by email and WhatsApp when it was raised.
            </p>
          </form>

          {/* The customer's numbers */}
          {isCustomer && (
            <div className="grid grid-cols-3 gap-2">
              <Link
                href="/portal/tickets"
                className="flex flex-col gap-1 rounded-[14px] bg-surface-2 p-3 transition-transform active:scale-95"
              >
                <span className="text-[22px] font-extrabold text-fg">{stats.totalTickets ?? 0}</span>
                <span className="text-[12px] leading-tight text-fg-muted">Tickets raised</span>
              </Link>
              <Link
                href="/portal/tickets"
                className="flex flex-col gap-1 rounded-[14px] bg-[#FDEBD8] p-3 transition-transform active:scale-95"
              >
                <span className="text-[22px] font-extrabold text-[#9A3412]">{stats.openTickets ?? 0}</span>
                <span className="text-[12px] leading-tight text-[#5C3A1A]">Open right now</span>
              </Link>
              <Link
                href="/portal/tickets/new"
                className="flex flex-col gap-1 rounded-[14px] bg-brand-soft p-3 text-brand transition-transform active:scale-95"
              >
                <Plus className="size-[26px]" />
                <span className="text-[12px] leading-tight font-bold">Raise new</span>
              </Link>
            </div>
          )}

          {/* Orders on their way */}
          {isCustomer &&
            activeOrders?.orders.map((order) => (
              <Link
                key={order._id}
                href={`/portal/orders/${order._id}`}
                className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-[0_2px_10px_rgba(36,26,94,0.05)] transition-transform active:scale-[0.98]"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#FFF1C7] text-[#9A5B00]">
                  <Truck className="size-[22px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[11.5px] font-bold text-fg-subtle">{order.orderNumber}</span>
                    <OrderStatusBadge status={order.status} />
                  </span>
                  <span className="mt-0.5 block truncate text-[14px] font-bold text-fg">
                    {order.items[0]?.name}
                    {order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-fg-subtle" />
              </Link>
            ))}

          {/* The customer's devices: one tap to book a repair */}
          {isCustomer && devices && (
            <section>
              <SectionTitle title="My devices" href="/portal/devices" action="Manage" />
              {devices.length === 0 ? (
                <Link
                  href="/portal/devices/new"
                  className="flex items-center gap-3.5 rounded-[20px] border border-dashed border-brand/40 bg-brand-soft p-4 transition-transform active:scale-[0.98]"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand text-white">
                    <Laptop className="size-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-extrabold text-fg">Add your devices</span>
                    <span className="block text-[12.5px] leading-snug text-fg-muted">
                      Book repairs in one tap and see every visit for each one.
                    </span>
                  </span>
                  <Plus className="size-5 text-brand" />
                </Link>
              ) : (
                <div className="stagger scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
                  {devices.map((device) => (
                    <div
                      key={device._id}
                      className="flex w-[156px] shrink-0 flex-col rounded-2xl border border-line bg-surface p-3 shadow-[0_2px_10px_rgba(36,26,94,0.05)]"
                    >
                      <Link href={`/portal/devices/${device._id}`} className="flex flex-col gap-1.5 active:scale-[0.97]">
                        <ArtTile kind={deviceMeta(device.type).art} size={52} />
                        <span className="truncate text-[13.5px] font-extrabold text-fg">{deviceTitle(device)}</span>
                        <span className="-mt-1 text-[11.5px] text-fg-muted">
                          {device.openTickets
                            ? `${device.openTickets} open ticket${device.openTickets > 1 ? 's' : ''}`
                            : `${device.ticketCount ?? 0} visit${device.ticketCount === 1 ? '' : 's'}`}
                        </span>
                      </Link>
                      <Link
                        href={`/portal/tickets/new?device=${device._id}`}
                        className="mt-2.5 inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-brand-soft text-[12px] font-bold text-brand transition-transform active:scale-95"
                      >
                        <Wrench className="size-3.5" />
                        Book repair
                      </Link>
                    </div>
                  ))}
                  <Link
                    href="/portal/devices/new"
                    className="flex w-[120px] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong text-fg-muted transition-transform active:scale-95"
                  >
                    <Plus className="size-6" />
                    <span className="text-[12.5px] font-bold">Add device</span>
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* Categories */}
          <section>
            <SectionTitle
              title={searching ? 'Matching services' : 'All services'}
              href={searching ? undefined : '/services'}
              action="Details"
            />
            {tiles && tiles.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line-strong p-5 text-center text-[13.5px] text-fg-muted">
                No service matches “{term}”. Try “laptop”, “CCTV” or “data”.
              </p>
            ) : (
              <div className="stagger grid grid-cols-3 gap-x-2.5 gap-y-3.5">
                {!tiles
                  ? Array.from({ length: 9 }).map((_, index) => (
                      <Skeleton key={index} className="h-[132px] rounded-2xl" />
                    ))
                  : tiles.map((service) => (
                      <Link
                        key={service._id}
                        href={`/services/${service.slug}`}
                        className="flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-surface px-1.5 pt-3 pb-2.5 text-center shadow-[0_2px_10px_rgba(36,26,94,0.05)] transition-transform active:scale-95"
                      >
                        <ArtTile kind={artForService(service)} size={60} />
                        <span className="line-clamp-2 text-[12.5px] leading-tight font-extrabold text-fg">
                          {service.title}
                        </span>
                        <span className="mt-auto text-[10.5px] text-fg-muted">
                          From {formatCurrency(service.startingPrice)}
                        </span>
                      </Link>
                    ))}
              </div>
            )}
          </section>

          {/* More support */}
          <section>
            <SectionTitle title="More support" />
            <div className="grid grid-cols-3 gap-2.5">
              {SUPPORT.map((item) => {
                const className =
                  'flex flex-col gap-2 rounded-2xl p-3 text-left transition-transform active:scale-95';
                const body = (
                  <>
                    <span
                      className="grid size-9 place-items-center rounded-[10px] text-white"
                      style={{ background: item.chip }}
                    >
                      <item.icon className="size-5" />
                    </span>
                    <span className="text-[13px] leading-tight font-extrabold text-[#241A5E]">{item.label}</span>
                    <span className="text-[11px] leading-snug" style={{ color: item.ink }}>
                      {item.sub}
                    </span>
                  </>
                );
                return item.href.startsWith('/') ? (
                  <Link key={item.label} href={item.href} className={className} style={{ background: item.bg }}>
                    {body}
                  </Link>
                ) : (
                  <a key={item.label} href={item.href} className={className} style={{ background: item.bg }}>
                    {body}
                  </a>
                );
              })}
            </div>
          </section>

          {/* Shop */}
          {products.length > 0 && (
            <section>
              <SectionTitle title="Sales · computers & accessories" href="/products" action="Shop all" />
              <div className="stagger scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
                {products.map((product) => {
                  const kind = artForProduct(product);
                  return (
                    <div key={product._id} className="flex w-[132px] shrink-0 flex-col gap-1.5">
                      <Link href="/products" className="flex flex-col gap-1.5 transition-transform active:scale-[0.97]">
                        <span
                          className="grid h-[100px] w-[132px] place-items-center rounded-[14px]"
                          style={{ background: ART_TINTS[kind] }}
                        >
                          <ServiceArt kind={kind} size={84} />
                        </span>
                        <span className="line-clamp-2 text-[13px] leading-snug font-bold text-fg">{product.name}</span>
                        <span className="text-[12px] font-extrabold text-fg">
                          {product.price > 0
                            ? formatCurrency(product.price)
                            : product.rentalPricePerDay > 0
                              ? `${formatCurrency(product.rentalPricePerDay)} / day`
                              : 'Ask for price'}
                          {product.mrp > product.price && product.price > 0 && (
                            <s className="ml-1 text-[11px] font-medium text-fg-subtle">{formatCurrency(product.mrp)}</s>
                          )}
                        </span>
                      </Link>
                      <AddToCart product={product} size="sm" className="mt-auto w-full" />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Offer */}
          <Link
            href={amc ? `/services/${amc.slug}` : '/portal/tickets/new'}
            className="relative isolate block overflow-hidden rounded-[20px] bg-linear-135 from-[#E2187D] to-[#B5125F] p-5 text-white shadow-[0_10px_26px_rgba(226,24,125,0.28)] transition-transform active:scale-[0.98]"
          >
            <span className="absolute -right-10 -bottom-20 -z-10 size-48 rounded-full bg-white/12" aria-hidden />
            <span className="absolute -top-12 right-16 -z-10 size-24 rounded-full bg-white/10" aria-hidden />
            <p className="text-[20px] leading-tight font-extrabold">
              {amc ? `Annual AMC from ${formatCurrency(amc.startingPrice)}` : 'Free diagnosis on every repair'}
            </p>
            <p className="mt-1.5 text-[14px] leading-snug text-[#FFE1EF]">
              {amc
                ? [amc.priceNote, amc.turnaround].filter(Boolean).join(' · ')
                : 'Know exactly what failed before you pay a rupee'}
            </p>
            <span className="mt-3.5 inline-flex h-10 items-center rounded-[10px] bg-white px-4 text-[13px] font-extrabold text-[#B5125F]">
              {amc ? 'View plans' : 'Raise a ticket'}
            </span>
          </Link>

          {/* Most booked */}
          {popular.length > 0 && (
            <section>
              <SectionTitle title="Most booked services" href="/services" />
              <div className="stagger scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
                {popular.map((service) => {
                  const kind = artForService(service);
                  return (
                    <Link
                      key={service._id}
                      href={`/services/${service.slug}`}
                      className="flex w-[148px] shrink-0 flex-col gap-2 transition-transform active:scale-[0.97]"
                    >
                      <span
                        className="grid h-[112px] w-[148px] place-items-center rounded-[14px]"
                        style={{ background: ART_TINTS[kind] }}
                      >
                        <ServiceArt kind={kind} size={92} />
                      </span>
                      <span className="line-clamp-1 text-[14px] font-bold text-fg">{service.title}</span>
                      <span className="-mt-1 text-[13px] text-fg-muted">
                        Starts at {formatCurrency(service.startingPrice)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* The customer's own tickets */}
          {isCustomer && (
            <section>
              <SectionTitle title="Your tickets" href="/portal/tickets" action="View all" />
              {!recent ? (
                <Skeleton className="h-28 rounded-2xl" />
              ) : recent.tickets.length === 0 ? (
                <div className="rounded-[20px] border border-line bg-surface p-5 text-center">
                  <p className="text-[15px] font-extrabold text-fg">No tickets yet</p>
                  <p className="mt-1 text-[13px] text-fg-muted">Pick a service and get an engineer in under a minute.</p>
                  <Button href="/portal/tickets/new" size="sm" className="mt-4 rounded-xl bg-accent px-5">
                    Raise a ticket
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recent.tickets.map((ticket) => (
                    <TicketCard key={ticket._id} ticket={ticket} basePath="/portal/tickets" />
                  ))}
                </div>
              )}
            </section>
          )}

          {!user && (
            <section className="rounded-[20px] border border-line bg-surface p-[18px]">
              <h2 className="text-[16px] leading-tight font-extrabold text-fg">Your tickets, in your pocket</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
                Sign in with your mobile number to raise tickets, follow every step and keep every invoice in one place.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <Button href="/login" className="rounded-xl bg-accent">
                  Sign in
                </Button>
                <Button href="/register" variant="secondary" className="rounded-xl">
                  Create account
                </Button>
              </div>
            </section>
          )}

          {/* More */}
          <section>
            <SectionTitle title="More" />
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
              {APP_MORE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3.5 text-[14.5px] font-semibold text-fg transition-colors active:bg-surface-2"
                  >
                    <item.icon className="size-[18px] text-accent" />
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight className="size-4 text-fg-subtle" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <p className="text-center text-[12px] leading-relaxed text-fg-subtle">
            {site.hours}
            <br />
            {site.emergency} · {site.phones[0]}
          </p>
        </div>
      </div>
    </div>
  );
}
