'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Clock, Phone, Plus, ShieldCheck, Wallet } from 'lucide-react';
import type { Service } from '@/lib/types';
import { site } from '@/lib/site';
import { useIsApp } from '@/lib/app-mode';
import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/misc';

export const SERVICE_STEPS = [
  {
    title: 'Raise a ticket or call us',
    body: 'Tell us the fault and pick on-site, carry-in or pickup. Takes under a minute.',
  },
  {
    title: 'Free diagnosis',
    body: 'A specialist inspects the device and reports exactly what has failed — no charge, no obligation.',
  },
  {
    title: 'You approve the quote',
    body: 'We post the estimate into your ticket. Work starts only after you say yes.',
  },
  {
    title: 'Repair, test and hand over',
    body: 'We fix it, stress-test it, and close the ticket with a written resolution and 30-day warranty.',
  },
];

/**
 * A service page inside the Android app: purple header, highlights, a pick
 * list of what the customer needs and a booking bar. Picked items travel to
 * the new-ticket form, which notes them in the description.
 */
export function AppServiceView({ service, bookHref }: { service: Service; bookHref: string }) {
  const isApp = useIsApp();
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (feature: string) =>
    setPicked((prev) => (prev.includes(feature) ? prev.filter((item) => item !== feature) : [...prev, feature]));

  const href = picked.length ? `${bookHref}&items=${encodeURIComponent(picked.join('\n'))}` : bookHref;

  const highlights = [
    { icon: Clock, title: service.turnaround || 'Quick turnaround', sub: 'turnaround' },
    { icon: ShieldCheck, title: '30 days', sub: 'warranty' },
    { icon: Wallet, title: 'UPI · card · cash', sub: 'payment' },
  ];

  // Portalled to <body>: the page transition animates a transform, which
  // would otherwise anchor this fixed bar to the page instead of the screen.
  const bookingBar = (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface px-4 pt-3 pb-[calc(var(--safe-bottom)+0.75rem)] shadow-[0_-10px_30px_-14px_rgba(0,0,0,0.18)]">
      <div className="mx-auto flex max-w-lg items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-fg-subtle">
            {picked.length
              ? `${picked.length} item${picked.length > 1 ? 's' : ''} selected · from`
              : 'Starting at'}
          </p>
          <p className="truncate text-[19px] font-extrabold text-fg">
            {formatCurrency(service.startingPrice)}{' '}
            <span className="text-[12px] font-medium text-fg-subtle">{service.priceNote}</span>
          </p>
        </div>
        <Button href={href} size="lg" className="shrink-0 rounded-2xl px-7">
          Book a slot
        </Button>
      </div>
    </div>
  );

  return (
    <div className="pb-32">
      <section className="app-hero relative isolate overflow-hidden px-5 pt-1 pb-14">
        <span className="absolute top-4 -right-24 -z-10 size-56 rounded-full bg-white/[0.07]" aria-hidden />
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-[1.6rem] leading-tight font-extrabold tracking-tight">{service.title}</h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-fg-muted">{service.shortDescription}</p>
          </div>
          <Icon name={service.icon} className="size-16 shrink-0 text-fg-muted" />
        </div>
      </section>

      <div className="relative z-10 mx-4 -mt-8 grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-surface py-3.5 shadow-lg shadow-black/5">
        {highlights.map((item) => (
          <div key={item.sub} className="flex flex-col items-center gap-1 px-2 text-center">
            <item.icon className="size-[18px] text-accent" />
            <p className="line-clamp-2 text-[11.5px] leading-tight font-bold text-fg">{item.title}</p>
            <p className="text-[10.5px] text-fg-subtle">{item.sub}</p>
          </div>
        ))}
      </div>

      <section className="mx-auto max-w-lg px-4 pt-7">
        <h2 className="text-[16px] font-bold text-fg">Select what you need</h2>
        <p className="mt-0.5 text-[12.5px] text-fg-subtle">
          Tap to add — we&apos;ll note it on your ticket.
        </p>
        <ul className="stagger mt-3 space-y-2.5">
          {service.features.map((feature) => {
            const on = picked.includes(feature);
            return (
              <li key={feature}>
                <button
                  type="button"
                  onClick={() => toggle(feature)}
                  aria-pressed={on}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl border bg-surface p-4 text-left transition-all active:scale-[0.98]',
                    on ? 'border-brand/50 shadow-md shadow-brand/10' : 'border-line'
                  )}
                >
                  <span className="flex-1 text-[14px] leading-snug font-semibold text-fg">{feature}</span>
                  <span
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1 rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition-colors',
                      on ? 'border-brand bg-brand text-brand-fg' : 'border-brand text-brand'
                    )}
                  >
                    {on ? (
                      <>
                        Added <Check className="size-3.5 animate-[pop_0.35s_cubic-bezier(0.34,1.56,0.64,1)]" />
                      </>
                    ) : (
                      <>
                        <Plus className="size-3.5" /> Add
                      </>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {service.description && (
        <section className="mx-auto max-w-lg px-4 pt-7">
          <h2 className="text-[16px] font-bold text-fg">About this service</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-fg-muted">{service.description}</p>
        </section>
      )}

      <section className="mx-auto max-w-lg px-4 pt-7">
        <h2 className="text-[16px] font-bold text-fg">How it works</h2>
        <ol className="mt-3 space-y-3.5 rounded-2xl border border-line bg-surface p-4">
          {SERVICE_STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-[12px] font-bold text-accent">
                {index + 1}
              </span>
              <div>
                <p className="text-[13.5px] font-bold text-fg">{step.title}</p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-fg-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <a
          href={`tel:${site.primaryPhone}`}
          className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition-transform active:scale-[0.98]"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-success-soft text-success">
            <Phone className="size-[18px]" />
          </span>
          <span className="flex-1">
            <span className="block text-[14px] font-bold text-fg">Talk to a technician</span>
            <span className="block text-[12px] text-fg-subtle">{site.phones[0]}</span>
          </span>
        </a>
      </section>

      {isApp && createPortal(bookingBar, document.body)}
    </div>
  );
}
