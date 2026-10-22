'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Plus, Search, ShoppingBag, Wrench } from 'lucide-react';
import { deviceApi } from '@/lib/endpoints';
import { useApi } from '@/lib/use-api';
import { deviceMeta, deviceTitle } from '@/lib/device-meta';
import type { Device } from '@/lib/types';
import { ArtTile } from '@/components/app/service-art';
import { Button } from '@/components/ui/button';
import { EmptyState, Skeleton } from '@/components/ui/misc';

function DeviceCard({ device }: { device: Device }) {
  const meta = deviceMeta(device.type);
  const subtitle = [device.name && device.brand, device.name && device.model].filter(Boolean).join(' ');
  return (
    <div className="group flex flex-col rounded-2xl border border-line bg-surface p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/8">
      <Link href={`/portal/devices/${device._id}`} className="flex items-start gap-3.5 active:scale-[0.98]">
        <ArtTile kind={meta.art} size={60} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold tracking-wider text-fg-subtle uppercase">{meta.label}</p>
          <h3 className="truncate text-[15px] font-bold text-fg transition-colors group-hover:text-brand">
            {deviceTitle(device)}
          </h3>
          {subtitle && <p className="truncate text-[12.5px] text-fg-muted">{subtitle}</p>}
          {device.serialNumber && (
            <p className="truncate font-mono text-[11.5px] text-fg-subtle">SN {device.serialNumber}</p>
          )}
        </div>
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11.5px] font-bold">
        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-fg-muted">
          {device.ticketCount ?? 0} visit{device.ticketCount === 1 ? '' : 's'}
        </span>
        {!!device.openTickets && (
          <span className="rounded-full bg-warning-soft px-2.5 py-1 text-warning">{device.openTickets} open</span>
        )}
        {device.source === 'order' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-brand">
            <ShoppingBag className="size-3" />
            Bought from us
          </span>
        )}
        {device.location && (
          <span className="inline-flex min-w-0 items-center gap-1 text-fg-subtle">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{device.location}</span>
          </span>
        )}
      </div>

      <Button
        href={`/portal/tickets/new?device=${device._id}`}
        size="sm"
        variant="secondary"
        className="mt-3.5 w-full rounded-xl"
      >
        <Wrench className="size-3.5 text-brand" />
        Book repair
      </Button>
    </div>
  );
}

export default function MyDevicesPage() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  const { data: devices, error, loading } = useApi(
    `devices:list:${query}`,
    () => deviceApi.list({ search: query || undefined }),
    { ttl: 20_000 }
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-fg app:hidden">My devices</h1>
          <p className="mt-1 text-[13.5px] text-fg-muted">
            Your laptops, PCs, CCTV and network gear — book a repair in one tap and see every visit.
          </p>
        </div>
        <Button href="/portal/devices/new">
          <Plus className="size-4" />
          Add device
        </Button>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(search.trim());
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-subtle" />
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            if (!event.target.value) setQuery('');
          }}
          placeholder="Search by name, model or serial number…"
          className="h-11 w-full rounded-xl border border-line bg-surface pr-4 pl-11 text-sm text-fg outline-none transition-all placeholder:text-fg-subtle focus:border-brand focus:ring-4 focus:ring-brand/12"
          aria-label="Search devices"
        />
      </form>

      {error && (
        <div className="rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">{error}</div>
      )}

      {loading || !devices ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : devices.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface">
          <EmptyState
            icon="Laptop"
            title={query ? 'No device matches' : 'No devices yet'}
            description={
              query
                ? 'Try another name, model or serial number.'
                : 'Add your laptop, desktop, printer or CCTV. Anything you buy from our shop shows up here by itself.'
            }
            action={
              !query && (
                <Button href="/portal/devices/new">
                  <Plus className="size-4" />
                  Add your first device
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => (
            <DeviceCard key={device._id} device={device} />
          ))}
        </div>
      )}
    </div>
  );
}
