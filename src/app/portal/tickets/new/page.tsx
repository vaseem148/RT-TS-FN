'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  Paperclip,
  Send,
  X,
} from 'lucide-react';
import { ticketApi } from '@/lib/endpoints';
import { toApiError } from '@/lib/api';
import { invalidate } from '@/lib/use-api';
import { cn, titleCase } from '@/lib/utils';
import { CATEGORY_ICON, PRIORITY_META, SERVICE_MODE_LABEL } from '@/lib/ticket-meta';
import type { TicketPriority } from '@/lib/types';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Select, Textarea } from '@/components/ui/field';
import { Icon, Spinner } from '@/components/ui/misc';

const CATEGORIES = [
  'computer-repair',
  'laptop-repair',
  'chip-level-service',
  'board-level-service',
  'cctv-installation',
  'cctv-service',
  'data-recovery',
  'spare-parts',
  'rental',
  'networking',
  'amc',
  'other',
];

const PRIORITIES: { value: TicketPriority; label: string; hint: string }[] = [
  { value: 'low', label: 'Low', hint: 'Whenever you can — no rush' },
  { value: 'medium', label: 'Medium', hint: 'Within a day or two' },
  { value: 'high', label: 'High', hint: 'Work is affected — today please' },
  { value: 'urgent', label: 'Urgent', hint: 'Everything is stopped — right now' },
];

const SERVICE_MODES = ['onsite', 'carry-in', 'pickup-drop', 'remote'];

const STEPS = ['The problem', 'Device & visit', 'Location & photos'];

function NewTicketForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);

  const [form, setForm] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium' as TicketPriority,
    serviceMode: 'onsite',
    deviceType: '',
    deviceBrand: '',
    deviceModel: '',
    serialNumber: '',
    underWarranty: false,
    line1: '',
    city: 'Chennai',
    pincode: '',
    landmark: '',
    preferredSlot: '',
  });

  // Deep links from the services pages pre-select the right category.
  useEffect(() => {
    const category = searchParams.get('category');
    const subject = searchParams.get('subject');
    setForm((prev) => ({
      ...prev,
      category: category && CATEGORIES.includes(category) ? category : prev.category,
      subject: subject ? `${subject} — ` : prev.subject,
    }));
  }, [searchParams]);

  // Default the service address to whatever is saved on the profile.
  useEffect(() => {
    if (user?.address?.line1) {
      setForm((prev) => ({
        ...prev,
        line1: prev.line1 || user.address?.line1 || '',
        city: user.address?.city || prev.city,
        pincode: prev.pincode || user.address?.pincode || '',
      }));
    }
  }, [user]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validateStep = () => {
    const next: Record<string, string> = {};

    if (step === 0) {
      if (!form.category) next.category = 'Pick the closest match';
      if (form.subject.trim().length < 5) next.subject = 'Give it a short title (5+ characters)';
      if (form.description.trim().length < 10)
        next.description = 'Tell us a bit more (10+ characters)';
    }
    if (step === 2 && form.serviceMode === 'onsite' && !form.line1.trim()) {
      next.line1 = 'We need an address to send a technician';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateStep()) return;

    setSubmitting(true);
    try {
      const ticket = await ticketApi.create(
        {
          subject: form.subject.trim(),
          description: form.description.trim(),
          category: form.category,
          priority: form.priority,
          serviceMode: form.serviceMode,
          device: {
            type: form.deviceType,
            brand: form.deviceBrand,
            model: form.deviceModel,
            serialNumber: form.serialNumber,
            underWarranty: form.underWarranty,
          },
          location: {
            line1: form.line1,
            city: form.city,
            pincode: form.pincode,
            landmark: form.landmark,
          },
          preferredSlot: form.preferredSlot || undefined,
        },
        files
      );

      // The new ticket must show up immediately on the lists and dashboards.
      invalidate('tickets:');
      invalidate('portal:');
      invalidate('stats:');

      toast.success(`Ticket ${ticket.ticketNumber} created — check your email and WhatsApp`);
      router.push(`/portal/tickets/${ticket._id}`);
    } catch (error) {
      const apiError = toApiError(error);
      setErrors(apiError.details || {});
      toast.error(apiError.message);
      if (apiError.details) setStep(0);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-fg sm:text-2xl">
          Raise a service ticket
        </h1>
        <p className="mt-1 text-[13.5px] text-fg-muted">
          Takes about a minute. You will get a ticket number instantly by email and WhatsApp.
        </p>
      </div>

      {/* Stepper */}
      <ol className="flex items-center gap-2">
        {STEPS.map((label, index) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => index < step && setStep(index)}
              disabled={index > step}
              className={cn(
                'flex items-center gap-2 text-left transition-opacity',
                index > step && 'opacity-50'
              )}
            >
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-bold transition-colors',
                  index < step
                    ? 'bg-success text-white'
                    : index === step
                      ? 'bg-brand text-brand-fg ring-4 ring-brand/20'
                      : 'border-2 border-line-strong bg-surface text-fg-subtle'
                )}
              >
                {index < step ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  'hidden text-[12.5px] font-bold sm:block',
                  index === step ? 'text-fg' : 'text-fg-subtle'
                )}
              >
                {label}
              </span>
            </button>
            {index < STEPS.length - 1 && (
              <span className={cn('h-0.5 flex-1 rounded', index < step ? 'bg-success' : 'bg-line')} />
            )}
          </li>
        ))}
      </ol>

      <Card className="overflow-hidden">
        <form onSubmit={submit}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5 p-5 sm:p-6"
            >
              {step === 0 && (
                <>
                  <div>
                    <label className="text-[13px] font-semibold text-fg">
                      What do you need help with?<span className="ml-0.5 text-danger">*</span>
                    </label>
                    <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {CATEGORIES.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => set('category', category)}
                          className={cn(
                            'flex items-center gap-2 rounded-xl border p-3 text-left transition-all',
                            form.category === category
                              ? 'border-brand bg-brand-soft text-brand shadow-sm'
                              : 'border-line bg-surface-2 text-fg-muted hover:border-brand/40'
                          )}
                        >
                          <Icon name={CATEGORY_ICON[category]} className="size-4 shrink-0" />
                          <span className="truncate text-[12.5px] font-semibold">
                            {titleCase(category)}
                          </span>
                        </button>
                      ))}
                    </div>
                    {errors.category && (
                      <p className="mt-1.5 text-xs font-medium text-danger">{errors.category}</p>
                    )}
                  </div>

                  <Input
                    label="Short title"
                    required
                    placeholder="e.g. Laptop not turning on after power cut"
                    value={form.subject}
                    onChange={(event) => set('subject', event.target.value)}
                    error={errors.subject}
                  />

                  <Textarea
                    label="Describe the problem"
                    required
                    rows={5}
                    placeholder="When did it start? What have you already tried? Any error messages or sounds? The more detail, the faster we can diagnose it."
                    value={form.description}
                    onChange={(event) => set('description', event.target.value)}
                    error={errors.description}
                  />

                  <div>
                    <label className="text-[13px] font-semibold text-fg">How urgent is it?</label>
                    <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                      {PRIORITIES.map((priority) => (
                        <button
                          key={priority.value}
                          type="button"
                          onClick={() => set('priority', priority.value)}
                          className={cn(
                            'rounded-xl border p-3 text-left transition-all',
                            form.priority === priority.value
                              ? 'border-brand bg-brand-soft shadow-sm'
                              : 'border-line bg-surface-2 hover:border-brand/40'
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className={cn('size-2 rounded-full', PRIORITY_META[priority.value].dot)}
                            />
                            <span className="text-[13px] font-bold text-fg">{priority.label}</span>
                          </span>
                          <span className="mt-0.5 block text-[11.5px] text-fg-muted">
                            {priority.hint}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div>
                    <label className="text-[13px] font-semibold text-fg">
                      How would you like it serviced?
                    </label>
                    <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                      {SERVICE_MODES.map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => set('serviceMode', mode)}
                          className={cn(
                            'rounded-xl border p-3 text-left text-[13px] font-semibold transition-all',
                            form.serviceMode === mode
                              ? 'border-brand bg-brand-soft text-brand shadow-sm'
                              : 'border-line bg-surface-2 text-fg-muted hover:border-brand/40'
                          )}
                        >
                          {SERVICE_MODE_LABEL[mode]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Device type"
                      placeholder="Laptop, desktop, DVR, hard disk…"
                      value={form.deviceType}
                      onChange={(event) => set('deviceType', event.target.value)}
                    />
                    <Input
                      label="Brand"
                      placeholder="HP, Dell, Hikvision…"
                      value={form.deviceBrand}
                      onChange={(event) => set('deviceBrand', event.target.value)}
                    />
                    <Input
                      label="Model"
                      placeholder="Pavilion 15, Latitude 3540…"
                      value={form.deviceModel}
                      onChange={(event) => set('deviceModel', event.target.value)}
                    />
                    <Input
                      label="Serial number"
                      placeholder="Optional — speeds up warranty checks"
                      value={form.serialNumber}
                      onChange={(event) => set('serialNumber', event.target.value)}
                    />
                  </div>

                  <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-surface-2 p-3.5">
                    <input
                      type="checkbox"
                      checked={form.underWarranty}
                      onChange={(event) => set('underWarranty', event.target.checked)}
                      className="size-4 accent-current"
                    />
                    <span className="text-[13px] font-semibold text-fg">
                      This device is still under warranty
                    </span>
                  </label>

                  <Input
                    label="Preferred visit time"
                    type="datetime-local"
                    hint="Optional — we will try to match it"
                    value={form.preferredSlot}
                    onChange={(event) => set('preferredSlot', event.target.value)}
                  />
                </>
              )}

              {step === 2 && (
                <>
                  {form.serviceMode === 'onsite' || form.serviceMode === 'pickup-drop' ? (
                    <>
                      <Input
                        label="Address"
                        required
                        placeholder="Door no, street, area"
                        value={form.line1}
                        onChange={(event) => set('line1', event.target.value)}
                        error={errors.line1}
                      />
                      <div className="grid gap-4 sm:grid-cols-3">
                        <Select
                          label="City"
                          value={form.city}
                          onChange={(event) => set('city', event.target.value)}
                          options={[
                            { value: 'Chennai', label: 'Chennai' },
                            { value: 'Vellore', label: 'Vellore' },
                            { value: 'Other', label: 'Other' },
                          ]}
                        />
                        <Input
                          label="Pincode"
                          placeholder="600095"
                          value={form.pincode}
                          onChange={(event) => set('pincode', event.target.value)}
                        />
                        <Input
                          label="Landmark"
                          placeholder="Near…"
                          value={form.landmark}
                          onChange={(event) => set('landmark', event.target.value)}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-start gap-3 rounded-xl border border-info/25 bg-info-soft p-4">
                      <CircleAlert className="mt-0.5 size-4 shrink-0 text-info" />
                      <p className="text-[13px] leading-relaxed text-fg">
                        You have chosen <b>{SERVICE_MODE_LABEL[form.serviceMode]}</b>. Our head
                        office is at Maduravoyal, Chennai and the branch is at Katpadi, Vellore —
                        walk in any day between 9:00 AM and 6:30 PM.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-[13px] font-semibold text-fg">Photos or videos</label>
                    <p className="mt-0.5 text-xs text-fg-subtle">
                      A photo of the fault, error screen or serial sticker helps a lot. Up to 5
                      files, 8 MB each.
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf,video/mp4"
                      onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 5))}
                      className="hidden"
                      id="ticket-attachments"
                    />
                    <label
                      htmlFor="ticket-attachments"
                      className="mt-2.5 flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-line bg-surface-2 p-6 text-center transition-colors hover:border-brand/45"
                    >
                      <Paperclip className="size-5 text-fg-subtle" />
                      <span className="text-[13px] font-semibold text-fg">
                        Click to attach files
                      </span>
                      <span className="text-[11.5px] text-fg-subtle">
                        JPG, PNG, PDF or MP4
                      </span>
                    </label>

                    {files.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {files.map((file, index) => (
                          <span
                            key={`${file.name}-${index}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[12px] text-fg-muted"
                          >
                            <Paperclip className="size-3" />
                            <span className="max-w-40 truncate">{file.name}</span>
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
                  </div>

                  {/* Review */}
                  <div className="rounded-xl border border-line bg-surface-2 p-4">
                    <p className="text-[11px] font-bold tracking-wider text-fg-subtle uppercase">
                      Quick review
                    </p>
                    <dl className="mt-2.5 grid gap-2 text-[13px] sm:grid-cols-2">
                      <div>
                        <dt className="text-fg-subtle">Service</dt>
                        <dd className="font-semibold text-fg">{titleCase(form.category)}</dd>
                      </div>
                      <div>
                        <dt className="text-fg-subtle">Priority</dt>
                        <dd className="font-semibold text-fg capitalize">{form.priority}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-fg-subtle">Title</dt>
                        <dd className="font-semibold text-fg">{form.subject || '—'}</dd>
                      </div>
                    </dl>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-2/50 p-4 sm:px-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={next}>
                Continue
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button type="submit" loading={submitting}>
                <Send className="size-4" />
                Submit ticket
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function NewTicketPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Spinner className="size-8" />
        </div>
      }
    >
      <NewTicketForm />
    </Suspense>
  );
}
