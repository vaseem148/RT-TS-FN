'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Cpu,
  Landmark,
  Lock,
  MapPin,
  Paperclip,
  Phone,
  Send,
  Star,
  UserCheck,
  Wallet,
  X,
} from 'lucide-react';
import { ticketApi, userApi } from '@/lib/endpoints';
import { toApiError } from '@/lib/api';
import { invalidate } from '@/lib/use-api';
import type { Ticket, User } from '@/lib/types';
import {
  absoluteUrl,
  cn,
  formatCurrency,
  formatDateTime,
  slaLabel,
  timeAgo,
  titleCase,
} from '@/lib/utils';
import { CATEGORY_ICON, SERVICE_MODE_LABEL, STATUS_META, allowedTransitions } from '@/lib/ticket-meta';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PriorityBadge, StatusBadge } from '@/components/ui/badge';
import { Input, Select, Textarea } from '@/components/ui/field';
import { Avatar, EmptyState, Icon, Modal, Spinner } from '@/components/ui/misc';

/* --------------------------- Sub-components --------------------------- */

function DetailRow({
  icon: RowIcon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <RowIcon className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold tracking-wider text-fg-subtle uppercase">{label}</p>
        <div className="mt-0.5 text-[13.5px] font-medium break-words text-fg">{children}</div>
      </div>
    </div>
  );
}

function AttachmentChip({ url, filename }: { url: string; filename: string }) {
  const href = absoluteUrl(url);
  const isImage = /\.(png|jpe?g|webp|gif)$/i.test(url);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2 py-1.5 pr-3 pl-2 text-[12px] font-medium text-fg-muted transition-colors hover:border-brand/45 hover:text-brand"
    >
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={href} alt="" className="size-7 rounded object-cover" />
      ) : (
        <span className="grid size-7 place-items-center rounded bg-surface">
          <Paperclip className="size-3.5" />
        </span>
      )}
      <span className="max-w-40 truncate">{filename || 'Attachment'}</span>
    </a>
  );
}

function Conversation({
  ticket,
  onPost,
}: {
  ticket: Ticket;
  onPost: (message: string, isInternal: boolean, files: File[]) => Promise<void>;
}) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [internal, setInternal] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const isStaff = user?.role !== 'customer';

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      await onPost(message.trim(), internal, files);
      setMessage('');
      setFiles([]);
      setInternal(false);
      if (fileInput.current) fileInput.current.value = '';
    } finally {
      setSending(false);
    }
  };

  const locked = ['closed', 'cancelled'].includes(ticket.status);

  return (
    <Card className="flex flex-col">
      <div className="border-b border-line p-5">
        <h2 className="text-[15px] font-bold text-fg">Conversation</h2>
        <p className="mt-0.5 text-[12.5px] text-fg-muted">
          {ticket.comments.length} message{ticket.comments.length === 1 ? '' : 's'} · everyone on
          this ticket is notified by email and WhatsApp
        </p>
      </div>

      <div className="flex max-h-125 flex-col gap-4 overflow-y-auto p-5">
        {ticket.comments.length === 0 ? (
          <p className="py-6 text-center text-[13.5px] text-fg-subtle">
            No messages yet. Say hello — the technician will see it straight away.
          </p>
        ) : (
          ticket.comments.map((comment) => {
            const mine = comment.author?._id === user?._id;
            return (
              <div
                key={comment._id}
                className={cn('flex gap-3', mine && 'flex-row-reverse')}
              >
                <Avatar name={comment.author?.name} src={comment.author?.avatar} size="sm" />
                <div className={cn('flex max-w-[80%] flex-col gap-1', mine && 'items-end')}>
                  <div className="flex items-center gap-2 text-[11.5px]">
                    <span className="font-bold text-fg">
                      {mine ? 'You' : comment.author?.name}
                    </span>
                    <span className="rounded bg-surface-2 px-1.5 py-0.5 font-semibold text-fg-subtle capitalize">
                      {comment.author?.role}
                    </span>
                    <span className="text-fg-subtle">{timeAgo(comment.createdAt)}</span>
                  </div>

                  <div
                    className={cn(
                      'rounded-2xl border px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap',
                      comment.isInternal
                        ? 'border-warning/30 bg-warning-soft text-fg'
                        : mine
                          ? 'border-brand/25 bg-brand-soft text-fg'
                          : 'border-line bg-surface-2 text-fg'
                    )}
                  >
                    {comment.isInternal && (
                      <span className="mb-1 flex items-center gap-1 text-[10.5px] font-bold tracking-wide text-warning uppercase">
                        <Lock className="size-3" />
                        Internal note — not visible to the customer
                      </span>
                    )}
                    {comment.message}
                  </div>

                  {comment.attachments?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {comment.attachments.map((file) => (
                        <AttachmentChip key={file._id} url={file.url} filename={file.filename} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {locked ? (
        <p className="border-t border-line bg-surface-2 p-4 text-center text-[13px] text-fg-muted">
          This ticket is {ticket.status}. Raise a new ticket if you need more help.
        </p>
      ) : (
        <form onSubmit={send} className="flex flex-col gap-2.5 border-t border-line p-4">
          <Textarea
            rows={3}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={
              isStaff
                ? 'Update the customer, or switch on an internal note for the team…'
                : 'Ask a question or add more detail…'
            }
            className="bg-surface-2"
          />

          {files.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {files.map((file, index) => (
                <span
                  key={`${file.name}-${index}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2 py-1 text-[11.5px] text-fg-muted"
                >
                  <Paperclip className="size-3" />
                  <span className="max-w-32 truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                    className="text-fg-subtle hover:text-danger"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInput}
              type="file"
              multiple
              accept="image/*,application/pdf,video/mp4"
              onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 5))}
              className="hidden"
              id="comment-attachments"
            />
            <label
              htmlFor="comment-attachments"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12.5px] font-semibold text-fg-muted transition-colors hover:border-brand/45 hover:text-brand"
            >
              <Paperclip className="size-3.5" />
              Attach
            </label>

            {isStaff && (
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12.5px] font-semibold text-fg-muted transition-colors hover:border-warning/45">
                <input
                  type="checkbox"
                  checked={internal}
                  onChange={(event) => setInternal(event.target.checked)}
                  className="size-3.5 accent-current"
                />
                <Lock className="size-3.5" />
                Internal note
              </label>
            )}

            <Button
              type="submit"
              size="sm"
              className="ml-auto"
              loading={sending}
              disabled={!message.trim()}
            >
              <Send className="size-3.5" />
              Send
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

function Timeline({ ticket }: { ticket: Ticket }) {
  const LABELS: Record<string, string> = {
    created: 'Ticket raised',
    assigned: 'Technician assigned',
    status_changed: 'Status changed',
    commented: 'Message posted',
    updated: 'Details updated',
    attachment_added: 'Files attached',
    rated: 'Service rated',
  };

  return (
    <Card className="p-5">
      <h2 className="text-[15px] font-bold text-fg">Activity</h2>
      <ol className="stagger mt-4 space-y-4">
        {[...ticket.activity].reverse().map((entry, index, all) => (
          <li key={entry._id} className="flex gap-3">
            <span className="relative flex flex-col items-center">
              <span className="mt-1 size-2 shrink-0 rounded-full bg-brand ring-4 ring-brand/12" />
              {index < all.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
            </span>
            <div className="flex-1 pb-1">
              <p className="text-[13px] font-bold text-fg">
                {LABELS[entry.action] ?? titleCase(entry.action)}
              </p>
              {entry.from && entry.to && entry.from !== entry.to && (
                <p className="mt-0.5 text-[12px] text-fg-muted">
                  {STATUS_META[entry.from as keyof typeof STATUS_META]?.label ?? titleCase(entry.from)}
                  {' → '}
                  <span className="font-semibold text-fg">
                    {STATUS_META[entry.to as keyof typeof STATUS_META]?.label ?? titleCase(entry.to)}
                  </span>
                </p>
              )}
              {entry.note && <p className="mt-0.5 text-[12px] text-fg-muted">{entry.note}</p>}
              <p className="mt-0.5 text-[11.5px] text-fg-subtle">
                {entry.by?.name ? `${entry.by.name} · ` : ''}
                {formatDateTime(entry.at)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function RatingBlock({ ticket, onRate }: { ticket: Ticket; onRate: (stars: number, feedback: string) => Promise<void> }) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  if (ticket.rating?.stars) {
    return (
      <Card className="p-5">
        <h2 className="text-[15px] font-bold text-fg">Your rating</h2>
        <div className="mt-2 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={
                index < (ticket.rating?.stars ?? 0)
                  ? 'size-5 fill-warning text-warning'
                  : 'size-5 text-line-strong'
              }
            />
          ))}
        </div>
        {ticket.rating.feedback && (
          <p className="mt-3 text-[13.5px] leading-relaxed text-fg-muted italic">
            “{ticket.rating.feedback}”
          </p>
        )}
        <p className="mt-2 text-[11.5px] text-fg-subtle">
          Submitted {formatDateTime(ticket.rating.ratedAt)}
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-brand/30 p-5">
      <h2 className="text-[15px] font-bold text-fg">How did we do?</h2>
      <p className="mt-1 text-[12.5px] text-fg-muted">
        Your rating goes straight to the technician who handled this job.
      </p>

      <div className="mt-3 flex gap-1" onMouseLeave={() => setHover(0)}>
        {Array.from({ length: 5 }).map((_, index) => {
          const value = index + 1;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setStars(value)}
              onMouseEnter={() => setHover(value)}
              className="transition-transform hover:scale-110"
              aria-label={`${value} star${value === 1 ? '' : 's'}`}
            >
              <Star
                className={
                  value <= (hover || stars)
                    ? 'size-7 fill-warning text-warning'
                    : 'size-7 text-line-strong'
                }
              />
            </button>
          );
        })}
      </div>

      <Textarea
        rows={3}
        className="mt-3 bg-surface-2"
        placeholder="Anything you'd like to add? (optional)"
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
      />

      <Button
        className="mt-3 w-full"
        disabled={!stars}
        loading={saving}
        onClick={async () => {
          setSaving(true);
          try {
            await onRate(stars, feedback);
          } finally {
            setSaving(false);
          }
        }}
      >
        Submit rating
      </Button>
    </Card>
  );
}

/* ----------------------------- Main view ------------------------------ */

export function TicketDetail({ ticketId, basePath }: { ticketId: string; basePath: string }) {
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState('');
  const [technicians, setTechnicians] = useState<User[]>([]);

  const [statusModal, setStatusModal] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [resolution, setResolution] = useState('');
  const [finalCost, setFinalCost] = useState('');
  const [assignModal, setAssignModal] = useState(false);
  const [technicianId, setTechnicianId] = useState('');
  const [estimate, setEstimate] = useState('');
  const [busy, setBusy] = useState(false);

  const isStaff = user?.role !== 'customer';
  const isAdmin = user?.role === 'admin';

  /** Any write here changes what the lists and dashboards should show. */
  const applyUpdate = useCallback((updated: Ticket) => {
    setTicket(updated);
    invalidate('tickets:');
    invalidate('portal:');
    invalidate('stats:');
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await ticketApi.get(ticketId);
      setTicket(data);
      setEstimate(String(data.estimatedCost || ''));
      setError('');
    } catch (err) {
      setError(toApiError(err).message);
    }
  }, [ticketId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (isAdmin) {
      userApi
        .technicians()
        .then(setTechnicians)
        .catch(() => {});
    }
  }, [isAdmin]);

  const postComment = async (message: string, isInternal: boolean, files: File[]) => {
    try {
      applyUpdate(await ticketApi.comment(ticketId, message, isInternal, files));
      toast.success(isInternal ? 'Internal note added' : 'Message sent');
    } catch (err) {
      toast.error(toApiError(err).message);
    }
  };

  const applyStatus = async () => {
    if (!statusModal) return;
    setBusy(true);
    try {
      applyUpdate(
        await ticketApi.changeStatus(ticketId, {
          status: statusModal,
          note: statusNote || undefined,
          resolutionSummary: statusModal === 'resolved' ? resolution : undefined,
          finalCost: statusModal === 'resolved' && finalCost ? Number(finalCost) : undefined,
        })
      );
      toast.success('Ticket updated');
      setStatusModal(null);
      setStatusNote('');
      setResolution('');
      setFinalCost('');
    } catch (err) {
      toast.error(toApiError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const assign = async () => {
    if (!technicianId) return;
    setBusy(true);
    try {
      applyUpdate(await ticketApi.assign(ticketId, technicianId));
      toast.success('Technician assigned and notified');
      setAssignModal(false);
    } catch (err) {
      toast.error(toApiError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const saveEstimate = async () => {
    setBusy(true);
    try {
      applyUpdate(await ticketApi.update(ticketId, { estimatedCost: Number(estimate) || 0 }));
      toast.success('Estimate saved — the customer can see it now');
    } catch (err) {
      toast.error(toApiError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const rate = async (stars: number, feedback: string) => {
    try {
      applyUpdate(await ticketApi.rate(ticketId, stars, feedback));
      toast.success('Thanks for the feedback!');
    } catch (err) {
      toast.error(toApiError(err).message);
    }
  };

  if (error) {
    return (
      <EmptyState
        icon="SearchX"
        title="Ticket not available"
        description={error}
        action={
          <Button href={basePath} variant="outline">
            Back to tickets
          </Button>
        }
      />
    );
  }

  if (!ticket) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-8" />
      </div>
    );
  }

  const sla = slaLabel(ticket.slaDueAt);
  const showSla = !['resolved', 'closed', 'cancelled'].includes(ticket.status);
  const transitions = allowedTransitions(ticket.status, user?.role ?? 'customer');
  const canRate =
    user?.role === 'customer' && ['resolved', 'closed'].includes(ticket.status);

  return (
    <div className="flex flex-col gap-5">
      <Link
        href={basePath}
        className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-fg-muted transition-colors hover:text-brand"
      >
        <ArrowLeft className="size-4" />
        All tickets
      </Link>

      {/* Header */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-linear-135 from-brand/15 to-accent/15 text-brand">
              <Icon name={CATEGORY_ICON[ticket.category]} className="size-6" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[13px] font-bold text-fg-subtle">
                  {ticket.ticketNumber}
                </span>
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
              <h1 className="mt-1.5 text-xl font-extrabold tracking-tight text-fg sm:text-2xl">
                {ticket.subject}
              </h1>
              <p className="mt-1 text-[12.5px] text-fg-subtle">
                Raised {timeAgo(ticket.createdAt)} · {titleCase(ticket.category)} ·{' '}
                {SERVICE_MODE_LABEL[ticket.serviceMode] ?? titleCase(ticket.serviceMode)}
              </p>
            </div>
          </div>

          {showSla && sla && (
            <div
              className={cn(
                'rounded-xl border px-4 py-2.5 text-center',
                sla.overdue
                  ? 'border-danger/25 bg-danger-soft'
                  : 'border-success/25 bg-success-soft'
              )}
            >
              <p className="text-[10.5px] font-bold tracking-wider text-fg-subtle uppercase">
                Response target
              </p>
              <p
                className={cn(
                  'mt-0.5 flex items-center gap-1.5 font-mono text-[15px] font-bold',
                  sla.overdue ? 'text-danger' : 'text-success'
                )}
              >
                {sla.overdue && <AlertTriangle className="size-4" />}
                {sla.text}
              </p>
            </div>
          )}
        </div>

        {transitions.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
            {isAdmin && (
              <Button size="sm" variant="secondary" onClick={() => setAssignModal(true)}>
                <UserCheck className="size-3.5" />
                {ticket.assignedTo ? 'Reassign' : 'Assign technician'}
              </Button>
            )}
            {transitions.map((next) => (
              <Button
                key={next}
                size="sm"
                variant={
                  next === 'resolved' ? 'success' : next === 'cancelled' ? 'danger' : 'outline'
                }
                onClick={() => setStatusModal(next)}
              >
                {next === 'cancelled'
                  ? 'Cancel ticket'
                  : next === 'closed'
                    ? 'Close ticket'
                    : `Mark ${STATUS_META[next].label.toLowerCase()}`}
              </Button>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <h2 className="text-[15px] font-bold text-fg">Reported issue</h2>
            <p className="mt-2 text-[14px] leading-relaxed whitespace-pre-wrap text-fg-muted">
              {ticket.description}
            </p>

            {ticket.attachments.length > 0 && (
              <div className="mt-4 border-t border-line pt-4">
                <p className="text-[11px] font-bold tracking-wider text-fg-subtle uppercase">
                  Attachments
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ticket.attachments.map((file) => (
                    <AttachmentChip key={file._id} url={file.url} filename={file.filename} />
                  ))}
                </div>
              </div>
            )}
          </Card>

          {ticket.resolutionSummary && (
            <Card className="border-success/25 bg-success-soft/40 p-5">
              <h2 className="text-[15px] font-bold text-success">Resolution</h2>
              <p className="mt-2 text-[14px] leading-relaxed whitespace-pre-wrap text-fg">
                {ticket.resolutionSummary}
              </p>
              {ticket.resolvedAt && (
                <p className="mt-2 text-[12px] text-fg-muted">
                  Completed {formatDateTime(ticket.resolvedAt)}
                </p>
              )}
            </Card>
          )}

          <Conversation ticket={ticket} onPost={postComment} />

          {canRate && <RatingBlock ticket={ticket} onRate={rate} />}
        </div>

        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <h2 className="text-[15px] font-bold text-fg">Details</h2>
            <div className="mt-4 space-y-4">
              {isStaff && (
                <DetailRow icon={Building2} label="Customer">
                  {ticket.customer?.name}
                  {ticket.customer?.company && (
                    <span className="block text-[12px] text-fg-muted">
                      {ticket.customer.company}
                    </span>
                  )}
                  {ticket.customer?.phone && (
                    <a
                      href={`tel:${ticket.customer.phone}`}
                      className="mt-1 inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand hover:underline"
                    >
                      <Phone className="size-3" />
                      {ticket.customer.phone}
                    </a>
                  )}
                </DetailRow>
              )}

              <DetailRow icon={UserCheck} label="Technician">
                {ticket.assignedTo ? (
                  <>
                    {ticket.assignedTo.name}
                    <a
                      href={`tel:${ticket.assignedTo.phone}`}
                      className="mt-1 inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand hover:underline"
                    >
                      <Phone className="size-3" />
                      {ticket.assignedTo.phone}
                    </a>
                  </>
                ) : (
                  <span className="text-warning">Being assigned</span>
                )}
              </DetailRow>

              {(ticket.device?.brand || ticket.device?.type) && (
                <DetailRow icon={Cpu} label="Device">
                  {[ticket.device.brand, ticket.device.model].filter(Boolean).join(' ') ||
                    ticket.device.type}
                  {ticket.device.type && ticket.device.brand && (
                    <span className="block text-[12px] text-fg-muted">{ticket.device.type}</span>
                  )}
                  {ticket.device.serialNumber && (
                    <span className="block font-mono text-[11.5px] text-fg-subtle">
                      S/N {ticket.device.serialNumber}
                    </span>
                  )}
                  {ticket.device.underWarranty && (
                    <span className="mt-1 inline-block rounded border border-success/25 bg-success-soft px-1.5 py-0.5 text-[10.5px] font-bold text-success">
                      Under warranty
                    </span>
                  )}
                </DetailRow>
              )}

              {ticket.location?.line1 && (
                <DetailRow icon={MapPin} label="Service location">
                  {ticket.location.line1}
                  <span className="block text-[12px] text-fg-muted">
                    {[ticket.location.city, ticket.location.pincode].filter(Boolean).join(' – ')}
                  </span>
                  {ticket.location.landmark && (
                    <span className="block text-[12px] text-fg-muted">
                      Landmark: {ticket.location.landmark}
                    </span>
                  )}
                </DetailRow>
              )}

              {ticket.preferredSlot && (
                <DetailRow icon={Calendar} label="Preferred slot">
                  {formatDateTime(ticket.preferredSlot)}
                </DetailRow>
              )}

              <DetailRow icon={Clock} label="Raised on">
                {formatDateTime(ticket.createdAt)}
              </DetailRow>

              {(ticket.estimatedCost > 0 || ticket.finalCost > 0) && (
                <DetailRow icon={Wallet} label="Cost">
                  {ticket.finalCost > 0 ? (
                    <>
                      {formatCurrency(ticket.finalCost)}
                      <span className="ml-1.5 text-[11.5px] font-semibold text-success">final</span>
                    </>
                  ) : (
                    <>
                      {formatCurrency(ticket.estimatedCost)}
                      <span className="ml-1.5 text-[11.5px] text-fg-muted">estimated</span>
                    </>
                  )}
                </DetailRow>
              )}
            </div>
          </Card>

          {isStaff && !['closed', 'cancelled'].includes(ticket.status) && (
            <Card className="p-5">
              <h2 className="text-[15px] font-bold text-fg">Cost estimate</h2>
              <p className="mt-1 text-[12.5px] text-fg-muted">
                Shown to the customer inside their portal.
              </p>
              <div className="mt-3 flex items-end gap-2">
                <Input
                  type="number"
                  min={0}
                  value={estimate}
                  onChange={(event) => setEstimate(event.target.value)}
                  icon={<Landmark className="size-4" />}
                  placeholder="0"
                  containerClassName="flex-1"
                />
                <Button onClick={saveEstimate} loading={busy}>
                  Save
                </Button>
              </div>
            </Card>
          )}

          <Timeline ticket={ticket} />
        </div>
      </div>

      {/* Status change modal */}
      <Modal
        open={!!statusModal}
        onClose={() => setStatusModal(null)}
        title={
          statusModal === 'cancelled'
            ? 'Cancel this ticket?'
            : `Move to ${statusModal ? (STATUS_META[statusModal as keyof typeof STATUS_META]?.label ?? statusModal) : ''}`
        }
        description="Everyone on this ticket is notified by email and WhatsApp."
      >
        <div className="flex flex-col gap-4">
          {statusModal === 'resolved' && (
            <>
              <Textarea
                label="What did you do?"
                required
                rows={4}
                placeholder="Describe the fault found and the repair carried out. The customer sees this."
                value={resolution}
                onChange={(event) => setResolution(event.target.value)}
              />
              <Input
                label="Final cost (₹)"
                type="number"
                min={0}
                placeholder="0"
                value={finalCost}
                onChange={(event) => setFinalCost(event.target.value)}
              />
            </>
          )}

          <Textarea
            label="Note (optional)"
            rows={3}
            placeholder="Anything to add to the activity log?"
            value={statusNote}
            onChange={(event) => setStatusNote(event.target.value)}
          />

          <div className="flex gap-2.5">
            <Button
              className="flex-1"
              variant={statusModal === 'cancelled' ? 'danger' : 'primary'}
              loading={busy}
              disabled={statusModal === 'resolved' && !resolution.trim()}
              onClick={applyStatus}
            >
              Confirm
            </Button>
            <Button variant="ghost" onClick={() => setStatusModal(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign modal */}
      <Modal
        open={assignModal}
        onClose={() => setAssignModal(false)}
        title="Assign a technician"
        description="Sorted by who has the lightest workload right now."
      >
        <div className="flex flex-col gap-4">
          <Select
            label="Technician"
            placeholder="Choose a technician"
            value={technicianId}
            onChange={(event) => setTechnicianId(event.target.value)}
            options={technicians.map((tech) => ({
              value: tech._id,
              label: `${tech.name} — ${tech.activeTicketCount ?? 0} active${tech.isAvailable ? '' : ' (unavailable)'}`,
            }))}
          />

          {technicianId && (
            <div className="rounded-xl border border-line bg-surface-2 p-3.5">
              {(() => {
                const tech = technicians.find((t) => t._id === technicianId);
                if (!tech) return null;
                return (
                  <div className="flex items-start gap-3">
                    <Avatar name={tech.name} size="sm" />
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-bold text-fg">{tech.name}</p>
                      <p className="text-[12px] text-fg-muted">{tech.phone}</p>
                      {tech.skills && tech.skills.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {tech.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded border border-line bg-surface px-1.5 py-0.5 text-[10.5px] font-medium text-fg-muted"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="flex gap-2.5">
            <Button className="flex-1" loading={busy} disabled={!technicianId} onClick={assign}>
              Assign &amp; notify
            </Button>
            <Button variant="ghost" onClick={() => setAssignModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
