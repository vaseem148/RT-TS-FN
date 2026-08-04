import type { Metadata } from 'next';
import { ArrowRight, Award, Building2, Heart, MapPin, Phone, Target, Users } from 'lucide-react';
import { site } from '@/lib/site';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Reveal, SectionHeading } from '@/components/ui/misc';
import { StatsSection } from '@/components/home/sections';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Renderways Technology has served Chennai and Vellore since 2016 with computer sales, chip-level repairs, CCTV systems, data recovery and IT rentals.',
};

const VALUES = [
  {
    icon: Target,
    title: 'Fix it, don’t replace it',
    body: 'Our chip-level bench exists because replacing a whole motherboard is lazy and expensive. We repair down to the component.',
  },
  {
    icon: Heart,
    title: 'Answer the phone',
    body: 'Someone picks up, every time — including at 2 AM. Our emergency line is the reason half our clients came to us.',
  },
  {
    icon: Users,
    title: 'Train, don’t churn',
    body: 'Our 85+ technicians are trained in-house and stay for years. The person who fixed your laptop in 2021 is probably still here.',
  },
  {
    icon: Award,
    title: 'Say the real price',
    body: 'Free diagnosis, written estimate inside your ticket, and no work starts until you approve it. No surprise line items.',
  },
];

const TIMELINE = [
  {
    year: '2016',
    title: 'One bench in Maduravoyal',
    body: 'Started as a two-person chip-level repair bench serving nearby shops and homes.',
  },
  {
    year: '2019',
    title: 'CCTV & security division',
    body: 'Added surveillance after too many customers asked us to fix cameras nobody else would touch.',
  },
  {
    year: '2021',
    title: 'Vellore branch opens',
    body: 'Katpadi branch launched to serve Vellore district with the same on-site response times.',
  },
  {
    year: '2023',
    title: 'Data recovery lab',
    body: 'Invested in a dedicated recovery setup for mechanical drive failures and RAID volumes.',
  },
  {
    year: '2026',
    title: 'Ticketing goes live',
    body: 'Launched our customer service desk — every job now tracked end to end, visible to the customer in real time.',
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        breadcrumbs={[{ label: 'About' }]}
        title={
          <>
            Ten years of keeping Chennai&apos;s{' '}
            <span className="text-gradient">machines running</span>
          </>
        }
        description={site.tagline}
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/contact" size="lg">
            Work with us
            <ArrowRight className="size-4" />
          </Button>
          <Button href={`tel:${site.primaryPhone}`} variant="outline" size="lg">
            <Phone className="size-4" />
            {site.phones[0]}
          </Button>
        </div>
      </PageHeader>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Our story"
              title="It started with a laptop everyone said was dead"
            />
            <div className="mt-6 space-y-4 text-[15.5px] leading-[1.75] text-fg-muted">
              <p>
                In 2016, Renderways Technology was established with a simple frustration: local
                service centres were replacing entire motherboards for faults that a competent
                technician could repair in an afternoon. Customers were paying for laziness.
              </p>
              <p>
                So we set up a microscope, a hot-air station and a rule — diagnose to the component
                before quoting anything. That approach turned a two-person bench in Maduravoyal into
                a two-branch operation serving over a thousand clients across Chennai and Vellore.
              </p>
              <p>
                Today we handle computer and laptop sales, board-level and chip-level repairs, CCTV
                surveillance, hard disk data recovery, networking and IT rentals. And in 2026 we
                added the thing customers asked for most: a real service desk, so you never have to
                call and ask &ldquo;any update?&rdquo; again.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid gap-4 sm:grid-cols-2">
              {VALUES.map((value) => (
                <Card key={value.title} hover className="h-full p-5">
                  <span className="grid size-11 place-items-center rounded-xl bg-linear-135 from-brand/15 to-accent/15 text-brand">
                    <value.icon className="size-5" />
                  </span>
                  <h3 className="mt-3.5 text-[15px] font-bold text-fg">{value.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{value.body}</p>
                </Card>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <StatsSection />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Milestones"
            title={
              <>
                How we got <span className="text-gradient">here</span>
              </>
            }
          />
        </Reveal>

        <div className="relative mt-14">
          <span
            className="absolute top-0 bottom-0 left-[15px] w-px bg-line lg:left-1/2"
            aria-hidden
          />
          <ol className="space-y-8">
            {TIMELINE.map((item, index) => (
              <Reveal key={item.year} delay={index * 0.08} as="li">
                <div
                  className={`relative flex gap-6 lg:w-1/2 ${
                    index % 2 === 0 ? 'lg:pr-12' : 'lg:ml-auto lg:flex-row-reverse lg:pl-12'
                  }`}
                >
                  <span className="absolute top-1.5 left-0 z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 border-brand bg-bg font-mono text-[10px] font-bold text-brand lg:static">
                    ●
                  </span>
                  <div className={`ml-12 flex-1 lg:ml-0 ${index % 2 === 0 ? 'lg:text-right' : ''}`}>
                    <span className="font-mono text-sm font-extrabold text-brand">{item.year}</span>
                    <h3 className="mt-1 text-[16px] font-bold text-fg">{item.title}</h3>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-fg-muted">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Find us"
            title={
              <>
                Two branches, <span className="text-gradient">one standard</span>
              </>
            }
          />
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {site.offices.map((office, index) => (
            <Reveal key={office.city} delay={index * 0.1}>
              <Card hover className="h-full p-6">
                <div className="flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                    <Building2 className="size-6" />
                  </span>
                  <div>
                    <span className="rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-[10.5px] font-bold tracking-wide text-fg-muted uppercase">
                      {office.label}
                    </span>
                    <h3 className="mt-2 text-lg font-bold text-fg">{office.city}</h3>
                    <p className="mt-1 flex items-start gap-1.5 text-[14px] text-fg-muted">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-brand" />
                      {office.address}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      <Button
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.mapQuery)}`}
                        variant="outline"
                        size="sm"
                      >
                        Open in Maps
                      </Button>
                      <Button href={`tel:${site.primaryPhone}`} variant="ghost" size="sm">
                        <Phone className="size-3.5" />
                        Call branch
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
