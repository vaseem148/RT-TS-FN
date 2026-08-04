'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, MessageSquare, Phone, Search, Trash2 } from 'lucide-react';
import { contactApi } from '@/lib/endpoints';
import { toApiError } from '@/lib/api';
import type { Enquiry } from '@/lib/types';
import { cn, formatDateTime, timeAgo } from '@/lib/utils';
import { whatsappLink } from '@/lib/site';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/field';
import { Avatar, EmptyState, Modal, Pagination, Skeleton } from '@/components/ui/misc';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed' },
];

const STATUS_STYLE: Record<string, string> = {
  new: 'text-info bg-info-soft border-info/25',
  contacted: 'text-warning bg-warning-soft border-warning/25',
  converted: 'text-success bg-success-soft border-success/25',
  closed: 'text-fg-muted bg-surface-2 border-line',
};

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[] | null>(null);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [error, setError] = useState('');

  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setEnquiries(null);
    try {
      const data = await contactApi.list({
        status: status || undefined,
        search: query || undefined,
        page,
      });
      setEnquiries(data.enquiries);
      setNewCount(data.newCount);
      setPages(data.pagination.pages);
      setTotal(data.pagination.total);
      setError('');
    } catch (err) {
      setError(toApiError(err).message);
      setEnquiries([]);
    }
  }, [status, query, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (enquiry: Enquiry, nextStatus: string) => {
    try {
      await contactApi.update(enquiry._id, { status: nextStatus });
      toast.success(`Marked as ${nextStatus}`);
      void load();
    } catch (err) {
      toast.error(toApiError(err).message);
    }
  };

  const saveNote = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await contactApi.update(selected._id, { internalNote: note, status: 'contacted' });
      toast.success('Note saved');
      setSelected(null);
      setNote('');
      void load();
    } catch (err) {
      toast.error(toApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (enquiry: Enquiry) => {
    try {
      await contactApi.remove(enquiry._id);
      toast.success('Enquiry deleted');
      void load();
    } catch (err) {
      toast.error(toApiError(err).message);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-fg">Website enquiries</h1>
        <p className="mt-1 text-[13.5px] text-fg-muted">
          {total} enquir{total === 1 ? 'y' : 'ies'} from the contact form
          {newCount > 0 && (
            <>
              {' · '}
              <span className="font-bold text-info">{newCount} waiting for a first response</span>
            </>
          )}
        </p>
      </div>

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
              placeholder="Search by name, email, phone or message…"
              className="h-11 w-full rounded-xl border border-line bg-surface pr-4 pl-11 text-sm text-fg outline-none transition-all placeholder:text-fg-subtle focus:border-brand focus:ring-4 focus:ring-brand/12"
              aria-label="Search enquiries"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value || 'all'}
              onClick={() => {
                setStatus(tab.value);
                setPage(1);
              }}
              className={cn(
                'rounded-lg border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors',
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

      {error && (
        <div className="rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {!enquiries ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : enquiries.length === 0 ? (
        <Card>
          <EmptyState
            icon="Inbox"
            title="No enquiries here"
            description="Messages sent through the website contact form land here automatically."
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {enquiries.map((enquiry) => (
            <Card key={enquiry._id} className="p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <Avatar name={enquiry.name} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[14.5px] font-bold text-fg">{enquiry.name}</p>
                      <Badge className={STATUS_STYLE[enquiry.status]}>{enquiry.status}</Badge>
                      {enquiry.serviceInterest && (
                        <Badge className="border-line bg-surface-2 text-fg-muted">
                          {enquiry.serviceInterest}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-[12px] text-fg-subtle">
                      {enquiry.subject} · {timeAgo(enquiry.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button href={`tel:${enquiry.phone}`} variant="secondary" size="sm">
                    <Phone className="size-3.5" />
                    Call
                  </Button>
                  <Button
                    href={whatsappLink(
                      `Hi ${enquiry.name}, this is Renderways Technology following up on your enquiry.`
                    )}
                    variant="secondary"
                    size="sm"
                  >
                    <MessageSquare className="size-3.5" />
                    WhatsApp
                  </Button>
                </div>
              </div>

              <p className="mt-3.5 rounded-xl border border-line bg-surface-2 p-3.5 text-[13.5px] leading-relaxed whitespace-pre-wrap text-fg">
                {enquiry.message}
              </p>

              {enquiry.internalNote && (
                <p className="mt-2.5 rounded-xl border border-warning/25 bg-warning-soft p-3 text-[12.5px] leading-relaxed text-fg">
                  <span className="font-bold text-warning">Internal note: </span>
                  {enquiry.internalNote}
                </p>
              )}

              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3.5">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
                  <a
                    href={`mailto:${enquiry.email}`}
                    className="inline-flex items-center gap-1.5 text-fg-muted transition-colors hover:text-brand"
                  >
                    <Mail className="size-3.5" />
                    {enquiry.email}
                  </a>
                  <a
                    href={`tel:${enquiry.phone}`}
                    className="inline-flex items-center gap-1.5 text-fg-muted transition-colors hover:text-brand"
                  >
                    <Phone className="size-3.5" />
                    {enquiry.phone}
                  </a>
                  <span className="text-fg-subtle">{formatDateTime(enquiry.createdAt)}</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelected(enquiry);
                      setNote(enquiry.internalNote ?? '');
                    }}
                    className="rounded-md px-2 py-1 text-[11.5px] font-bold text-brand transition-colors hover:bg-brand-soft"
                  >
                    Add note
                  </button>
                  {enquiry.status !== 'converted' && (
                    <button
                      onClick={() => void updateStatus(enquiry, 'converted')}
                      className="rounded-md px-2 py-1 text-[11.5px] font-bold text-success transition-colors hover:bg-success-soft"
                    >
                      Mark converted
                    </button>
                  )}
                  {enquiry.status !== 'closed' && (
                    <button
                      onClick={() => void updateStatus(enquiry, 'closed')}
                      className="rounded-md px-2 py-1 text-[11.5px] font-bold text-fg-muted transition-colors hover:bg-surface-2"
                    >
                      Close
                    </button>
                  )}
                  <button
                    onClick={() => void remove(enquiry)}
                    className="rounded-md p-1.5 text-fg-subtle transition-colors hover:bg-danger-soft hover:text-danger"
                    aria-label="Delete enquiry"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} pages={pages} onChange={setPage} />

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Internal note"
        description={`Only staff can see this. ${selected?.name ?? ''} will not be notified.`}
      >
        <div className="flex flex-col gap-4">
          <Textarea
            rows={5}
            placeholder="Called and left a voicemail. Quote for 10 refurbished laptops sent by email."
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <div className="flex gap-2.5">
            <Button className="flex-1" loading={saving} onClick={saveNote}>
              Save note
            </Button>
            <Button variant="ghost" onClick={() => setSelected(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
