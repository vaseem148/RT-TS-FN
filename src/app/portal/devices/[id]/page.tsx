'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Calendar, ChevronRight, Hash, MapPin, Pencil, ShoppingBag, Trash2, TriangleAlert, UserCheck, Wrench } from 'lucide-react';
import { deviceApi } from '@/lib/endpoints';
import { toApiError } from '@/lib/api';
import { invalidate, useApi } from '@/lib/use-api';
import { deviceMeta, deviceTitle } from '@/lib/device-meta';
import { CATEGORY_ICON } from '@/lib/ticket-meta';
import { formatDate, timeAgo } from '@/lib/utils';
import { ArtTile } from '@/components/app/service-art';
import { DeviceForm } from '@/components/devices/device-form';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState, Icon, Modal, Spinner } from '@/components/ui/misc';

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'warning' | 'brand' }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3.5 text-center">
      <p
        className={
          tone === 'warning' && value > 0
            ? 'text-2xl font-extrabold text-warning'
            : tone === 'brand'
              ? 'text-2xl font-extrabold text-brand'
              : 'text-2xl font-extrabold text-fg'
        }
      >
        {value}
      </p>
      <p className="mt-0.5 text-[11.5px] font-semibold text-fg-muted">{label}</p>
    </div>
  );
}

export default function DevicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  const { data, error, setData } = useApi(`devices:one:${id}`, () => deviceApi.get(id), { ttl: 20_000 });

  const remove = async () => {
    setRemoving(true);
    try {
      await deviceApi.remove(id);
      invalidate('devices:');
      toast.success('Device removed');
      router.replace('/portal/devices');
    } catch (err) {
      toast.error(toApiError(err).message);
      setRemoving(false);
    }
  };

  if (error) {
    return (
      <EmptyState
        icon="SearchX"
        title="Device not available"
        description={error}
        action={
          <Button href="/portal/devices" variant="outline">
            Back to my devices
          </Button>
        }
      />
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-8" />
      </div>
    );
  }

  const { device, stats, tickets } = data;
  const meta = deviceMeta(device.type);

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/portal/devices"
        className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-fg-muted transition-colors hover:text-brand app:hidden"
      >
        <ArrowLeft className="size-4" />
        My devices
      </Link>

      <Card className="relative overflow-hidden p-5 sm:p-6">
        <div className="aurora opacity-50" aria-hidden />
        <div className="relative flex flex-wrap items-start gap-4">
          <ArtTile kind={meta.art} size={84} className="rw-f1" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold tracking-wider text-fg-subtle uppercase">{meta.label}</p>
            <h1 className="mt-0.5 text-xl font-extrabold tracking-tight text-fg sm:text-2xl">{deviceTitle(device)}</h1>
            {device.name && (device.brand || device.model) && (
              <p className="text-[13.5px] text-fg-muted">{[device.brand, device.model].filter(Boolean).join(' ')}</p>
            )}
            <div className="mt-3 flex flex-col gap-1.5 text-[12.5px] text-fg-muted">
              {device.serialNumber && (
                <span className="inline-flex items-center gap-1.5 font-mono">
                  <Hash className="size-3.5 text-fg-subtle" />
                  {device.serialNumber}
                </span>
              )}
              {device.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-fg-subtle" />
                  {device.location}
                </span>
              )}
              {device.purchasedOn && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-fg-subtle" />
                  Bought {formatDate(device.purchasedOn)}
                </span>
              )}
              {device.source === 'order' && (
                <span className="inline-flex items-center gap-1.5 font-semibold text-brand">
                  <ShoppingBag className="size-3.5" />
                  Bought from Renderways
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
          <Button
            href={`/portal/tickets/new?device=${device._id}`}
            className="flex-1 sm:flex-none app:bg-linear-90 app:from-accent app:to-brand"
          >
            <Wrench className="size-4" />
            Book repair
          </Button>
          <Button variant="secondary" onClick={() => setEditing(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button variant="ghost" onClick={() => setConfirmRemove(true)} className="text-danger hover:text-danger">
            <Trash2 className="size-4" />
            <span className="sr-only sm:not-sr-only">Remove</span>
          </Button>
        </div>
      </Card>

      {stats.repeatIssue && (
        <div className="page-enter flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning-soft p-4">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warning" />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-fg">This one keeps coming back</p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-fg-muted">
              Two or more visits in the last 30 days. An AMC plan covers repeat visits and keeps it checked
              regularly.
            </p>
            <Link href="/services/residential-commercial-amc" className="mt-1.5 inline-block text-[13px] font-bold text-brand">
              See AMC plans →
            </Link>
          </div>
        </div>
      )}

      <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total visits" value={stats.totalVisits} tone="brand" />
        <Stat label="Open now" value={stats.open} tone="warning" />
        <Stat label="This week" value={stats.thisWeek} />
        <Stat label="This month" value={stats.thisMonth} />
      </div>

      <Card className="p-5">
        <h2 className="text-[15px] font-bold text-fg">Service history</h2>
        {tickets.length === 0 ? (
          <p className="py-8 text-center text-[13.5px] text-fg-subtle">
            No visits yet. When something goes wrong, tap Book repair — it shows up here.
          </p>
        ) : (
          <ol className="mt-3 divide-y divide-line">
            {tickets.map((ticket) => (
              <li key={ticket._id}>
                <Link
                  href={`/portal/tickets/${ticket._id}`}
                  className="group flex items-center gap-3 py-3 transition-colors active:bg-surface-2"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-linear-135 from-brand/12 to-accent/12 text-brand">
                    <Icon name={CATEGORY_ICON[ticket.category]} className="size-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11.5px] font-bold text-fg-subtle">{ticket.ticketNumber}</span>
                      <StatusBadge status={ticket.status} />
                    </span>
                    <span className="mt-0.5 block truncate text-[14px] font-bold text-fg group-hover:text-brand">
                      {ticket.subject}
                    </span>
                    <span className="mt-0.5 flex flex-wrap gap-x-3 text-[12px] text-fg-subtle">
                      <span>{timeAgo(ticket.createdAt)}</span>
                      {ticket.assignedTo && (
                        <span className="inline-flex items-center gap-1">
                          <UserCheck className="size-3.5" />
                          {ticket.assignedTo.name}
                        </span>
                      )}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-fg-subtle" />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </Card>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit device" size="lg">
        <DeviceForm
          device={device}
          onCancel={() => setEditing(false)}
          onSaved={(saved) => {
            setData({ ...data, device: saved });
            setEditing(false);
          }}
        />
      </Modal>

      <Modal
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        title="Remove this device?"
        description="Its tickets stay in My tickets; only the device card goes."
        size="sm"
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmRemove(false)}>
            Keep it
          </Button>
          <Button variant="danger" loading={removing} onClick={() => void remove()}>
            Remove
          </Button>
        </div>
      </Modal>
    </div>
  );
}
