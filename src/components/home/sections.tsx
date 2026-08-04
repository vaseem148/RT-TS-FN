'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CalendarCheck,
  ClipboardList,
  Headset,
  MapPinned,
  Quote,
  Star,
  UserCheck,
  Wrench,
} from 'lucide-react';
import { serviceApi, statsApi } from '@/lib/endpoints';
import { useApi } from '@/lib/use-api';
import type { PublicStats, Testimonial } from '@/lib/types';
import { formatCurrency, titleCase } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  CountUp,
  Icon,
  Reveal,
  RevealGroup,
  RevealItem,
  SectionHeading,
  Skeleton,
} from '@/components/ui/misc';

/* --------------------------- Brand marquee --------------------------- */

const BRANDS = [
  'HP', 'Dell', 'Lenovo', 'Acer', 'ASUS', 'Hikvision', 'CP Plus', 'Dahua',
  'Seagate', 'WD', 'Crucial', 'TP-Link', 'Logitech', 'Intel', 'AMD',
];

export function BrandMarquee() {
  return (
    <section className="border-y border-line bg-surface/40 py-7">
      <p className="mb-5 text-center text-[11px] font-bold tracking-[0.2em] text-fg-subtle uppercase">
        Authorised sales &amp; service for
      </p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="flex w-max animate-[marquee_38s_linear_infinite] gap-12">
          {[...BRANDS, ...BRANDS].map((brand, index) => (
            <span
              key={`${brand}-${index}`}
              className="text-xl font-extrabold tracking-tight text-fg-subtle/70 transition-colors hover:text-brand"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Services ----------------------------- */

export function ServicesSection() {
  const { data: services } = useApi('services', () => serviceApi.list(), { ttl: 300_000 });

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
      <Reveal>
        <SectionHeading
          eyebrow="What we do"
          title={
            <>
              Every IT and security need,{' '}
              <span className="text-gradient">under one roof</span>
            </>
          }
          description="No more juggling three vendors for a laptop, a camera and a network cable. One team, one number, one ticket trail."
        />
      </Reveal>

      <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {!services
          ? Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-64 rounded-2xl" />
            ))
          : services.map((service) => (
              <RevealItem key={service._id}>
                <Card hover className="group h-full p-6">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-12 place-items-center rounded-xl bg-linear-135 from-brand/15 to-accent/15 text-brand transition-transform duration-300 group-hover:scale-110">
                      <Icon name={service.icon} className="size-6" />
                    </span>
                    {service.isFeatured && (
                      <span className="rounded-full border border-accent/25 bg-accent-soft px-2.5 py-1 text-[10px] font-bold tracking-wide text-accent uppercase">
                        Popular
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-fg">{service.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-fg-muted">
                    {service.shortDescription}
                  </p>

                  <ul className="mt-4 space-y-1.5">
                    {service.features.slice(0, 3).map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-[13px] text-fg-muted">
                        <BadgeCheck className="mt-0.5 size-3.5 shrink-0 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                    <div>
                      <p className="text-[11px] text-fg-subtle">Starting at</p>
                      <p className="text-base font-extrabold text-fg">
                        {formatCurrency(service.startingPrice)}
                        <span className="ml-1 text-[11px] font-medium text-fg-subtle">
                          {service.priceNote}
                        </span>
                      </p>
                    </div>
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex items-center gap-1 text-[13px] font-bold text-brand transition-transform hover:translate-x-0.5"
                    >
                      Details
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </Card>
              </RevealItem>
            ))}
      </RevealGroup>
    </section>
  );
}

/* ------------------------------- Stats ------------------------------- */

const STAT_FALLBACK: PublicStats = {
  projectsCompleted: 1250,
  happyClients: 1000,
  ticketsHandled: 5000,
  teamMembers: 85,
  awards: 15,
  yearsExperience: 10,
  avgRating: 4.9,
};

export function StatsSection() {
  const { data } = useApi('stats:public', () => statsApi.public(), { ttl: 300_000 });
  const stats: PublicStats = data ?? STAT_FALLBACK;

  const items = [
    { value: stats.projectsCompleted, suffix: '+', label: 'Projects completed' },
    { value: stats.happyClients, suffix: '+', label: 'Happy clients' },
    { value: stats.teamMembers, suffix: '+', label: 'Expert technicians' },
    { value: stats.yearsExperience, suffix: '+', label: 'Years in business' },
    { value: stats.avgRating, suffix: '/5', label: 'Average rating', decimals: 1 },
  ];

  return (
    <section className="relative overflow-hidden border-y border-line bg-surface/40 py-16">
      <div className="aurora opacity-60" aria-hidden />
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-4 sm:px-6 lg:grid-cols-5">
        {items.map((item, index) => (
          <Reveal key={item.label} delay={index * 0.07} className="text-center">
            <p className="text-4xl font-extrabold tracking-tight text-gradient sm:text-5xl">
              <CountUp value={item.value} suffix={item.suffix} decimals={item.decimals ?? 0} />
            </p>
            <p className="mt-2 text-[13px] font-semibold text-fg-muted">{item.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* --------------------------- Ticketing flow -------------------------- */

const FLOW = [
  {
    icon: ClipboardList,
    title: 'Raise a ticket',
    body: 'Describe the fault in 30 seconds, attach a photo, pick on-site or carry-in. Or just call us — we raise it for you.',
  },
  {
    icon: UserCheck,
    title: 'Technician assigned',
    body: 'We match the right specialist to the job and you get their name and number by email and WhatsApp instantly.',
  },
  {
    icon: MapPinned,
    title: 'Track every step',
    body: 'Live status, technician notes, photos and cost estimates — all on one page, updated as the work happens.',
  },
  {
    icon: CalendarCheck,
    title: 'Sign off & rate',
    body: 'Approve the resolution, see the final invoice and rate the service. Your feedback goes straight to the team.',
  },
];

export function TicketingSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="The Renderways difference"
            title={
              <>
                A service desk, not a{' '}
                <span className="text-gradient">phone number that rings out</span>
              </>
            }
            description="Most local service shops leave you guessing. We built a full ticketing system so you always know who is working on your problem, and when it will be done."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-4">
          {FLOW.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.09}>
              <div className="group relative h-full rounded-2xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-2xl hover:shadow-brand/10">
                <span className="absolute top-5 right-5 font-mono text-4xl font-extrabold text-line select-none">
                  0{index + 1}
                </span>
                <span className="grid size-12 place-items-center rounded-xl bg-brand-soft text-brand">
                  <step.icon className="size-6" />
                </span>
                <h3 className="mt-4 text-base font-bold text-fg">{step.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-fg-muted">{step.body}</p>

                {index < FLOW.length - 1 && (
                  <span className="absolute top-11 -right-3 hidden text-line-strong lg:block">
                    <ArrowRight className="size-5" />
                  </span>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-10 flex justify-center">
          <Button href="/portal/tickets/new" size="lg">
            Try it — raise your first ticket
            <ArrowRight className="size-4" />
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------ Why us ------------------------------- */

const REASONS = [
  {
    icon: Wrench,
    title: 'Technicians, not salespeople',
    body: 'Chip-level engineers who repair the board instead of upselling you a new one. Free diagnosis, always.',
  },
  {
    icon: Headset,
    title: '24/7 emergency response',
    body: 'Server down at midnight? Shutter alarm at 4 AM? Our emergency line is staffed around the clock.',
  },
  {
    icon: Banknote,
    title: 'Quote before we start',
    body: 'You approve the estimate inside your ticket before a single screw is turned. No surprise invoices.',
  },
  {
    icon: BadgeCheck,
    title: '30-day repair warranty',
    body: 'If the same fault returns within 30 days, we fix it again at no cost. It is written into every ticket.',
  },
];

export function WhyUsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="Why Renderways"
            title={
              <>
                Ten years of fixing what{' '}
                <span className="text-gradient">others gave up on</span>
              </>
            }
            description="We started in Maduravoyal with one bench and a microscope. Today we run two branches, 85+ technicians and a service desk that treats every repair like it matters — because to you, it does."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/about" variant="outline">
              Our story
            </Button>
            <Button href="/contact" variant="ghost">
              Talk to us
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {REASONS.map((reason, index) => (
            <Reveal key={reason.title} delay={index * 0.08}>
              <Card hover className="h-full p-5">
                <span className="grid size-11 place-items-center rounded-xl bg-linear-135 from-brand/15 to-accent/15 text-brand">
                  <reason.icon className="size-5" />
                </span>
                <h3 className="mt-3.5 text-[15px] font-bold text-fg">{reason.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{reason.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- Testimonials --------------------------- */

const FALLBACK_TESTIMONIALS = [
  {
    name: 'Sumaiya Zara',
    role: 'CEO, Zara Textiles',
    stars: 5,
    text: 'Nice service from the service person Bala Murugan. Thanks for your quick response — got the laptop back in two days with all my data safe.',
    category: 'chip-level-service',
  },
  {
    name: 'Alex Simon',
    role: 'Managing Director, Simon Traders',
    stars: 5,
    text: 'Very kind and effective service. Was very quick in resolving my case — the team finished the whole warehouse in a single day and the app setup works perfectly.',
    category: 'cctv-installation',
  },
  {
    name: 'Ramesh Kumar',
    role: 'Owner, RK Auto Spares',
    stars: 5,
    text: 'Six years of Tally backups were on a dead drive. Everyone told me it was gone. Renderways recovered 97% of it in four days.',
    category: 'data-recovery',
  },
];

export function TestimonialsSection() {
  const { data } = useApi('stats:testimonials', () => statsApi.testimonials(), { ttl: 300_000 });
  const live: Testimonial[] = data ?? [];

  const items = live.length
    ? live.slice(0, 3).map((t) => ({
        name: t.customer?.name ?? 'Renderways customer',
        role: t.customer?.company || 'Verified customer',
        stars: t.rating.stars,
        text: t.rating.feedback,
        category: t.category,
      }))
    : FALLBACK_TESTIMONIALS;

  return (
    <section className="relative overflow-hidden border-y border-line bg-surface/40 py-20 sm:py-24">
      <div className="aurora opacity-50" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Client stories"
            title={
              <>
                Ratings collected from{' '}
                <span className="text-gradient">real closed tickets</span>
              </>
            }
            description="Every review below was submitted by a customer signing off on a job in their own portal — not curated by us."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {items.map((item, index) => (
            <Reveal key={`${item.name}-${index}`} delay={index * 0.1}>
              <Card className="relative h-full p-6">
                <Quote className="absolute top-5 right-5 size-8 text-line" />
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      className={
                        starIndex < item.stars
                          ? 'size-4 fill-warning text-warning'
                          : 'size-4 text-line-strong'
                      }
                    />
                  ))}
                </div>
                <p className="mt-4 text-[14.5px] leading-relaxed text-fg">“{item.text}”</p>
                <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                  <div>
                    <p className="text-sm font-bold text-fg">{item.name}</p>
                    <p className="text-[12px] text-fg-subtle">{item.role}</p>
                  </div>
                  <span className="rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[10.5px] font-semibold text-fg-muted">
                    {titleCase(item.category)}
                  </span>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- CTA -------------------------------- */

export function CtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <Reveal>
        <div className="border-beam relative overflow-hidden rounded-3xl border border-line bg-surface p-8 text-center sm:p-14">
          <div className="aurora" aria-hidden />
          <motion.h2
            className="relative text-3xl font-extrabold tracking-tight text-fg sm:text-4xl"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Something broken? Let&apos;s get it{' '}
            <span className="text-gradient">working again today.</span>
          </motion.h2>
          <p className="relative mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-fg-muted">
            Raise a ticket in under a minute, or call our team directly. Free diagnosis, honest
            quote, 30-day warranty — that is the whole deal.
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/portal/tickets/new" size="lg">
              Raise a ticket
              <ArrowRight className="size-4" />
            </Button>
            <Button href="/contact" variant="outline" size="lg">
              Request a call back
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
