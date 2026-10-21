'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CircleAlert, Phone, Search, Ticket as TicketIcon, UserCheck } from 'lucide-react';
import { ticketApi } from '@/lib/endpoints';
import { toApiError } from '@/lib/api';
import type { Ticket } from '@/lib/types';
import { site } from '@/lib/site';
import { formatDateTime, slaLabel, timeAgo, titleCase } from '@/lib/utils';
import { STATUS_META } from '@/lib/ticket-meta';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PriorityBadge, StatusBadge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/misc';

const STAGES: { key: string; label: string }[] = [
  { key: 'open', label: 'Raised' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

function stageIndex(status: string) {
  if (status === 'awaiting_customer') return 2;
  if (status === 'cancelled') return -1;
  return STAGES.findIndex((stage) => stage.key === status);
}

function TrackContent() {
  const searchParams = useSearchParams();
  const initial = searchParams.get('t') ?? '';

  const [value, setValue] = useState(initial);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = useCallback(async (ticketNumber: string) => {
    const trimmed = ticketNumber.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    setTicket(null);
    try {
      setTicket(await ticketApi.track(trimmed));
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initial) void lookup(initial);
  }, [initial, lookup]);

  const sla = ticket ? slaLabel(ticket.slaDueAt) : null;
  const current = ticket ? stageIndex(ticket.status) : -1;

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 app:py-6">
      <Card className="p-6 sm:p-8">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void lookup(value);
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-subtle" />
            <input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="RW-2026-0001"
              aria-label="Ticket number"
              className="h-12 w-full rounded-xl border border-line bg-surface-2 pr-4 pl-11 font-mono text-sm tracking-wide text-fg uppercase outline-none transition-all placeholder:text-fg-subtle placeholder:normal-case focus:border-brand focus:bg-surface focus:ring-4 focus:ring-brand/12"
            />
          </div>
          <Button type="submit" size="lg" loading={loading}>
            Track ticket
          </Button>
        </form>

        <p className="mt-3 text-[12.5px] text-fg-subtle">
          Your ticket number was sent to you by email and WhatsApp when the job was raised.
        </p>
      </Card>

      {loading && (
        <div className="mt-8 flex justify-center">
          <Spinner className="size-8" />
        </div>
      )}

      {error && (
        <Card className="mt-8 flex flex-col items-center gap-3 p-8 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-danger-soft text-danger">
            <CircleAlert className="size-6" />
          </span>
          <h2 className="text-lg font-bold text-fg">{error}</h2>
          <p className="max-w-sm text-[14px] text-fg-muted">
            Double-check the number, or sign in to your portal to see all your tickets in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/login" variant="outline">
              Sign in to portal
            </Button>
            <Button href={`tel:${site.primaryPhone}`} variant="ghost">
              <Phone className="size-4" />
              Call us
            </Button>
          </div>
        </Card>
      )}

      {ticket && (
        <Card className="mt-8 overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-6">
            <div>
              <p className="font-mono text-lg font-extrabold text-fg">{ticket.ticketNumber}</p>
              <h2 className="mt-1 text-[16px] font-bold text-fg">{ticket.subject}</h2>
              <p className="mt-1 text-[13px] text-fg-muted">
                Raised {timeAgo(ticket.createdAt)} · {titleCase(ticket.category)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>

          {ticket.status !== 'cancelled' && (
            <div className="p-6">
              <ol className="flex flex-col gap-0 sm:flex-row sm:items-start">
                {STAGES.map((stage, index) => {
                  const done = current >= index;
                  const active = current === index;
                  return (
                    <li key={stage.key} className="flex flex-1 gap-3 sm:flex-col sm:gap-2">
                      <div className="flex flex-col items-center sm:w-full sm:flex-row">
                        <span
                          className={`grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold transition-colors ${
                            done
                              ? 'bg-brand text-brand-fg'
                              : 'border-2 border-line-strong bg-surface text-fg-subtle'
                          } ${active ? 'ring-4 ring-brand/20' : ''}`}
                        >
                          {done ? '✓' : index + 1}
                        </span>
                        {index < STAGES.length - 1 && (
                          <span
                            className={`my-1 h-8 w-0.5 sm:my-0 sm:ml-1 sm:h-0.5 sm:w-full ${
                              current > index ? 'bg-brand' : 'bg-line'
                            }`}
                          />
                        )}
                      </div>
                      <p
                        className={`pb-4 text-[12.5px] font-semibold sm:pb-0 ${
                          done ? 'text-fg' : 'text-fg-subtle'
                        }`}
                      >
                        {stage.label}
                      </p>
                    </li>
                  );
                })}
              </ol>

              {ticket.status === 'awaiting_customer' && (
                <p className="mt-4 rounded-xl border border-warning/25 bg-warning-soft px-4 py-3 text-[13px] font-semibold text-warning">
                  We are waiting on a response from you before we can continue. Please check your
                  email or sign in to reply.
                </p>
              )}
            </div>
          )}

          <dl className="grid gap-px border-t border-line bg-line sm:grid-cols-2">
            <div className="bg-surface p-5">
              <dt className="text-[11px] font-bold tracking-wider text-fg-subtle uppercase">
                Current status
              </dt>
              <dd className="mt-1.5 text-[15px] font-bold text-fg">
                {STATUS_META[ticket.status]?.label ?? titleCase(ticket.status)}
              </dd>
            </div>
            <div className="bg-surface p-5">
              <dt className="text-[11px] font-bold tracking-wider text-fg-subtle uppercase">
                Technician
              </dt>
              <dd className="mt-1.5 flex items-center gap-1.5 text-[15px] font-bold text-fg">
                {ticket.assignedTo ? (
                  <>
                    <UserCheck className="size-4 text-brand" />
                    {ticket.assignedTo.name}
                  </>
                ) : (
                  <span className="text-fg-muted">Being assigned</span>
                )}
              </dd>
            </div>
            <div className="bg-surface p-5">
              <dt className="text-[11px] font-bold tracking-wider text-fg-subtle uppercase">
                Raised on
              </dt>
              <dd className="mt-1.5 text-[15px] font-bold text-fg">
                {formatDateTime(ticket.createdAt)}
              </dd>
            </div>
            <div className="bg-surface p-5">
              <dt className="text-[11px] font-bold tracking-wider text-fg-subtle uppercase">
                {ticket.resolvedAt ? 'Resolved on' : 'Target response'}
              </dt>
              <dd
                className={`mt-1.5 text-[15px] font-bold ${
                  !ticket.resolvedAt && sla?.overdue ? 'text-danger' : 'text-fg'
                }`}
              >
                {ticket.resolvedAt
                  ? formatDateTime(ticket.resolvedAt)
                  : sla
                    ? sla.text
                    : '—'}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-3 border-t border-line bg-surface-2 p-5">
            <Button href="/login" size="sm">
              Sign in for full details
            </Button>
            <Button href={`tel:${site.primaryPhone}`} variant="outline" size="sm">
              <Phone className="size-3.5" />
              Call about this ticket
            </Button>
          </div>
        </Card>
      )}

      {!ticket && !loading && !error && (
        <Card className="mt-8 flex flex-col items-center gap-3 p-10 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-surface-2 text-fg-subtle">
            <TicketIcon className="size-6" />
          </span>
          <h2 className="text-lg font-bold text-fg">Enter your ticket number above</h2>
          <p className="max-w-sm text-[14px] text-fg-muted">
            No ticket yet? Raise one in under a minute and we will get a technician on it right
            away.
          </p>
          <Button href="/portal/tickets/new" variant="outline">
            Raise a new ticket
          </Button>
        </Card>
      )}
    </section>
  );
}

export default function TrackPage() {
  return (
    <>
      <PageHeader
        eyebrow="Track"
        breadcrumbs={[{ label: 'Track Ticket' }]}
        title={
          <>
            Where is my <span className="text-gradient">repair?</span>
          </>
        }
        description="Enter your ticket number to see live status, the assigned technician and your expected response time — no sign-in needed."
      />
      <Suspense
        fallback={
          <div className="flex justify-center py-24">
            <Spinner className="size-8" />
          </div>
        }
      >
        <TrackContent />
      </Suspense>
    </>
  );
}
