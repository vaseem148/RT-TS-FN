'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Phone, Search, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { site } from '@/lib/site';
import { Button } from '@/components/ui/button';

const TRUST = [
  { icon: ShieldCheck, label: '30-day warranty' },
  { icon: Clock, label: '24/7 emergency call' },
  { icon: Star, label: '4.9 / 5 from 1000+ clients' },
];

const FLOATING = [
  { label: 'RW-2026-0184', sub: 'Chip-level · Resolved', tone: 'success', x: '6%', y: '18%', delay: 0 },
  { label: 'Technician assigned', sub: 'Bala M. · 12 min ago', tone: 'brand', x: '72%', y: '10%', delay: 0.9 },
  { label: '8 cameras live', sub: 'Ambattur warehouse', tone: 'accent', x: '78%', y: '68%', delay: 1.8 },
];

export function Hero() {
  const [ticketNumber, setTicketNumber] = useState('');
  const router = useRouter();

  const track = (event: React.FormEvent) => {
    event.preventDefault();
    const value = ticketNumber.trim().toUpperCase();
    if (value) router.push(`/track?t=${encodeURIComponent(value)}`);
  };

  return (
    <section className="relative isolate overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
      <div className="aurora" aria-hidden />
      <div className="absolute inset-0 -z-10 grid-bg" aria-hidden />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand-soft/70 px-4 py-1.5 text-[12px] font-bold tracking-wide text-brand"
          >
            <Sparkles className="size-3.5" />
            Chennai · Vellore · Since 2016
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.06 }}
            className="mt-5 text-[2.6rem] leading-[1.06] font-extrabold tracking-tight text-fg sm:text-6xl lg:text-[4.1rem]"
          >
            Your IT problems,
            <br />
            <span className="text-gradient">solved and tracked.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.14 }}
            className="mt-6 max-w-xl text-[16.5px] leading-relaxed text-fg-muted"
          >
            Computers, laptops, chip-level repairs, CCTV, data recovery and rentals — delivered by a
            team you can actually reach. Every job becomes a ticket you can follow in real time,
            from the first call to the final signature.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button href="/portal/tickets/new" size="lg" className="border-beam">
              Raise a service ticket
              <ArrowRight className="size-4" />
            </Button>
            <Button href={`tel:${site.primaryPhone}`} variant="outline" size="lg">
              <Phone className="size-4" />
              {site.phones[0]}
            </Button>
          </motion.div>

          {/* Track a ticket without signing in */}
          <motion.form
            onSubmit={track}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 flex max-w-md items-center gap-2 rounded-xl border border-line bg-surface/70 p-1.5 backdrop-blur"
          >
            <Search className="ml-2.5 size-4 shrink-0 text-fg-subtle" />
            <input
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              placeholder="Already have a ticket? e.g. RW-2026-0001"
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-fg outline-none placeholder:text-fg-subtle"
              aria-label="Ticket number"
            />
            <Button type="submit" size="sm" variant="secondary">
              Track
            </Button>
          </motion.form>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            {TRUST.map(({ icon: TrustIcon, label }) => (
              <li key={label} className="flex items-center gap-2 text-[13px] font-semibold text-fg-muted">
                <TrustIcon className="size-4 text-brand" />
                {label}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Visual: live ticket card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="absolute -inset-8 -z-10 rounded-full bg-brand/12 blur-3xl" aria-hidden />

          <div className="border-beam relative rounded-3xl border border-line bg-surface/85 p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-brand-soft font-mono text-[11px] font-bold text-brand">
                  RW
                </span>
                <div>
                  <p className="font-mono text-[13px] font-bold text-fg">RW-2026-0007</p>
                  <p className="text-[11px] text-fg-subtle">Raised 12 minutes ago</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand-soft px-2.5 py-1 text-[11px] font-bold text-brand">
                <span className="size-1.5 animate-pulse rounded-full bg-brand" />
                In progress
              </span>
            </div>

            <div className="mt-4 rounded-2xl border border-line bg-surface-2 p-4">
              <p className="text-sm font-bold text-fg">CCTV DVR not recording footage</p>
              <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
                Cameras show live feed but nothing is being saved for the last 3 days.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {['High priority', 'On-site', 'Anna Nagar'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-line bg-surface px-2 py-0.5 text-[10.5px] font-semibold text-fg-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <ol className="mt-4 space-y-3">
              {[
                { label: 'Ticket raised', time: '2:14 PM', done: true },
                { label: 'Technician assigned — Karthik R.', time: '2:26 PM', done: true },
                { label: 'On the way to site', time: '2:41 PM', done: true },
                { label: 'Diagnosis & repair', time: 'ETA 3:30 PM', done: false },
              ].map((step, index) => (
                <li key={step.label} className="flex items-start gap-3">
                  <span className="relative mt-0.5 flex flex-col items-center">
                    <span
                      className={
                        step.done
                          ? 'size-2.5 rounded-full bg-brand ring-4 ring-brand/15'
                          : 'size-2.5 rounded-full border-2 border-line-strong bg-surface'
                      }
                    />
                    {index < 3 && (
                      <span
                        className={`mt-1 h-6 w-px ${step.done ? 'bg-brand/35' : 'bg-line'}`}
                      />
                    )}
                  </span>
                  <div className="flex-1 pb-0.5">
                    <p
                      className={`text-[13px] font-semibold ${step.done ? 'text-fg' : 'text-fg-subtle'}`}
                    >
                      {step.label}
                    </p>
                    <p className="text-[11px] text-fg-subtle">{step.time}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-success/20 bg-success-soft px-3.5 py-2.5">
              <span className="text-[12px] font-bold text-success">SLA on track</span>
              <span className="font-mono text-[12px] font-bold text-success">4h 12m left</span>
            </div>
          </div>

          {/* Floating status chips */}
          {FLOATING.map((chip) => (
            <motion.div
              key={chip.label}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + chip.delay, duration: 0.5 }}
              style={{ left: chip.x, top: chip.y }}
              className="pointer-events-none absolute hidden animate-[float_7s_ease-in-out_infinite] rounded-xl border border-line bg-surface/90 px-3 py-2 shadow-xl backdrop-blur-md xl:block"
            >
              <p className="text-[11.5px] font-bold text-fg">{chip.label}</p>
              <p className="text-[10px] text-fg-subtle">{chip.sub}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
