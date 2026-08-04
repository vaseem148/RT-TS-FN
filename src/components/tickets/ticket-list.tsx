'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Clock, MapPin, Search, SlidersHorizontal, UserCheck } from 'lucide-react';
import { ticketApi, type TicketQuery } from '@/lib/endpoints';
import { useApi } from '@/lib/use-api';
import type { Ticket } from '@/lib/types';
import { cn, slaLabel, timeAgo, titleCase } from '@/lib/utils';
import { CATEGORY_ICON } from '@/lib/ticket-meta';
import { PriorityBadge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState, Icon, Pagination, Skeleton } from '@/components/ui/misc';

const STATUS_TABS = [
  { value: 'active', label: 'Active' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'awaiting_customer', label: 'Awaiting reply' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'archived', label: 'Closed' },
  { value: '', label: 'All' },
];

export function TicketCard({ ticket, basePath }: { ticket: Ticket; basePath: string }) {
  const sla = slaLabel(ticket.slaDueAt);
  const showSla = !['resolved', 'closed', 'cancelled'].includes(ticket.status);

  return (
    <Link
      href={`${basePath}/${ticket._id}`}
      className="group block rounded-2xl border border-line bg-surface p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/8 sm:p-5"
    >
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-135 from-brand/12 to-accent/12 text-brand">
          <Icon name={CATEGORY_ICON[ticket.category]} className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="font-mono text-[12px] font-bold text-fg-subtle">
              {ticket.ticketNumber}
            </span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            {showSla && sla?.overdue && (
              <span className="inline-flex items-center gap-1 rounded-full border border-danger/25 bg-danger-soft px-2 py-0.5 text-[10.5px] font-bold text-danger">
                <AlertTriangle className="size-3" />
                Overdue
              </span>
            )}
          </div>

          <h3 className="mt-1.5 truncate text-[15px] font-bold text-fg transition-colors group-hover:text-brand">
            {ticket.subject}
          </h3>
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-fg-muted">
            {ticket.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-fg-subtle">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {timeAgo(ticket.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name={CATEGORY_ICON[ticket.category]} className="size-3.5" />
              {titleCase(ticket.category)}
            </span>
            {ticket.assignedTo ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-fg-muted">
                <UserCheck className="size-3.5 text-brand" />
                {ticket.assignedTo.name}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-semibold text-warning">
                <UserCheck className="size-3.5" />
                Unassigned
              </span>
            )}
            {ticket.location?.city && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {ticket.location.city}
              </span>
            )}
            {showSla && sla && !sla.overdue && (
              <span className="ml-auto font-mono text-[11.5px] font-bold text-success">
                {sla.text}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function TicketList({
  basePath,
  baseQuery = {},
  showFilters = true,
  emptyAction,
  refreshKey,
}: {
  basePath: string;
  baseQuery?: TicketQuery;
  showFilters?: boolean;
  emptyAction?: React.ReactNode;
  refreshKey?: number;
}) {
  const [status, setStatus] = useState('active');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  // baseQuery is an object literal from the caller, so it is serialised into
  // the cache key rather than used as a dependency.
  const scope = JSON.stringify(baseQuery);

  const { data, error, loading } = useApi(
    `tickets:${scope}:${status}:${query}:${page}:${refreshKey ?? 0}`,
    () =>
      ticketApi.list({
        ...baseQuery,
        status: status || undefined,
        search: query || undefined,
        page,
        limit: 10,
      }),
    { ttl: 20_000 }
  );

  const tickets = data?.tickets;
  const pages = data?.pagination.pages ?? 1;
  const total = data?.pagination.total ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {showFilters && (
        <div className="flex flex-col gap-3">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setQuery(search.trim());
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-subtle" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by ticket number, subject or description…"
                className="h-11 w-full rounded-xl border border-line bg-surface pr-4 pl-11 text-sm text-fg outline-none transition-all placeholder:text-fg-subtle focus:border-brand focus:ring-4 focus:ring-brand/12"
                aria-label="Search tickets"
              />
            </div>
            <Button type="submit" variant="secondary">
              <SlidersHorizontal className="size-4" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </form>

          <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value || 'all'}
                onClick={() => {
                  setStatus(tab.value);
                  setPage(1);
                }}
                className={cn(
                  'shrink-0 rounded-lg border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors',
                  status === tab.value
                    ? 'border-brand bg-brand text-brand-fg'
                    : 'border-line bg-surface text-fg-muted hover:border-brand/45 hover:text-brand'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {tickets && tickets.length > 0 && (
        <p className="text-[12.5px] text-fg-muted">
          <span className="font-bold text-fg">{total}</span> ticket{total === 1 ? '' : 's'} found
        </p>
      )}

      {loading || !tickets ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface">
          <EmptyState
            icon="TicketX"
            title="No tickets here"
            description={
              status === 'active'
                ? 'Nothing active right now. Raise a ticket and it will show up here instantly.'
                : 'No tickets match this filter. Try a different status or clear your search.'
            }
            action={emptyAction}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map((ticket) => (
            <TicketCard key={ticket._id} ticket={ticket} basePath={basePath} />
          ))}
        </div>
      )}

      <Pagination page={page} pages={pages} onChange={setPage} className="mt-2" />
    </div>
  );
}
