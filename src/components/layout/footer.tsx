import Link from 'next/link';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { site } from '@/lib/site';
import { Logo } from './logo';

const serviceLinks = [
  { label: 'Chip-level Service', href: '/services/chip-level-service' },
  { label: 'CCTV Installation', href: '/services/cctv-installation' },
  { label: 'Data Recovery', href: '/services/hard-disk-data-recovery' },
  { label: 'Computer Sales', href: '/services/computer-sales' },
  { label: 'IT Rentals', href: '/services/it-peripheral-rentals' },
  { label: 'Networking', href: '/services/networking-wifi-setup' },
];

const supportLinks = [
  { label: 'Raise a Ticket', href: '/portal/tickets/new' },
  { label: 'Track Your Ticket', href: '/track' },
  { label: 'Customer Portal', href: '/portal' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'About Renderways', href: '/about' },
];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line bg-bg-subtle">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand/45 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-fg-muted">
              {site.tagline}. From a single laptop repair to a full CCTV rollout — one team, one
              ticket, tracked end to end.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {['ISO-grade process', '30-day warranty', 'Free diagnosis'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-semibold text-fg-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-[13px] font-bold tracking-wider text-fg uppercase">Services</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-fg-muted transition-colors hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-[13px] font-bold tracking-wider text-fg uppercase">Support</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-fg-muted transition-colors hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h3 className="text-[13px] font-bold tracking-wider text-fg uppercase">Reach us</h3>

            <ul className="mt-4 flex flex-col gap-4 text-sm">
              {site.offices.map((office) => (
                <li key={office.city} className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-brand" />
                  <div>
                    <p className="font-semibold text-fg">{office.label}</p>
                    <p className="text-fg-muted">{office.address}</p>
                  </div>
                </li>
              ))}

              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-brand" />
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {site.phones.map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone.replace(/\s/g, '')}`}
                      className="font-medium text-fg-muted transition-colors hover:text-brand"
                    >
                      {phone}
                    </a>
                  ))}
                </div>
              </li>

              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-brand" />
                <a
                  href={`mailto:${site.email}`}
                  className="text-fg-muted transition-colors hover:text-brand"
                >
                  {site.email}
                </a>
              </li>

              <li className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-brand" />
                <div>
                  <p className="text-fg-muted">{site.hours}</p>
                  <p className="font-semibold text-success">{site.emergency}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
          <p className="text-xs text-fg-subtle">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-fg-subtle">
            <Link href="/privacy" className="transition-colors hover:text-brand">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-brand">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
