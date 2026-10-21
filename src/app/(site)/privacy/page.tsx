import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { PageHeader } from '@/components/layout/page-header';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${site.name} collects, uses and protects your personal data.`,
};

const SECTIONS = [
  {
    title: 'What we collect',
    body: 'When you create an account or raise a service ticket we store your name, email address, phone number, service address and the details of the device or issue you reported — including any photos you attach. If you use our contact form we keep the message and the details you supplied with it.',
  },
  {
    title: 'Why we collect it',
    body: 'We use this information to diagnose and repair your equipment, dispatch a technician to the right address, keep you updated on ticket progress by email and WhatsApp, raise invoices, and honour warranty claims. We do not use your data for advertising.',
  },
  {
    title: 'Data recovery and confidentiality',
    body: 'Data recovery work is carried out under strict confidentiality. We access recovered files only as far as needed to verify the recovery, we never copy them elsewhere, and drives and recovered data are returned or securely wiped once the job is closed and you have confirmed receipt.',
  },
  {
    title: 'CCTV footage',
    body: 'During installation or servicing our technicians may briefly view camera feeds to confirm the system is working. We do not retain, copy or export footage from your recorder, and we do not retain remote access to your system after a job is closed unless you ask us to as part of an AMC.',
  },
  {
    title: 'Who we share it with',
    body: 'Your details are shared only with the Renderways technician assigned to your ticket and the administrators managing our service desk. We do not sell or rent your data. We share information with third parties only where the law requires it, or where a component supplier needs a serial number to process a warranty claim.',
  },
  {
    title: 'How long we keep it',
    body: 'Ticket records and invoices are retained for seven years to satisfy accounting and warranty obligations. Attachments you upload to a ticket are kept for the life of that ticket. You can ask us to delete your account at any time; we will remove your personal profile while keeping the minimum invoice records the law requires.',
  },
  {
    title: 'Your choices',
    body: 'You can update your details or turn email and WhatsApp notifications on or off at any time from your profile page in the customer portal. You can request a copy of your data or its deletion by writing to us at the address below.',
  },
  {
    title: 'Security',
    body: 'Passwords are stored hashed, never in plain text. Access to the service desk is restricted by role, so technicians see only the tickets assigned to them. Internal staff notes on a ticket are never shown to customers.',
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        breadcrumbs={[{ label: 'Privacy Policy' }]}
        title="Privacy Policy"
        description="Plain-English summary of what we collect, why we need it, and what we will never do with it."
      />

      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 app:py-6">
        <p className="text-[13px] text-fg-subtle">
          Last updated {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </p>

        <div className="mt-8 flex flex-col gap-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-bold text-fg">{section.title}</h2>
              <p className="mt-2 text-[15px] leading-[1.75] text-fg-muted">{section.body}</p>
            </section>
          ))}

          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-lg font-bold text-fg">Contact us about privacy</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">
              Questions, corrections or deletion requests — write to{' '}
              <a href={`mailto:${site.email}`} className="font-semibold text-brand hover:underline">
                {site.email}
              </a>{' '}
              or call{' '}
              <a
                href={`tel:${site.primaryPhone}`}
                className="font-semibold text-brand hover:underline"
              >
                {site.phones[0]}
              </a>
              .
            </p>
            <p className="mt-3 text-[14px] text-fg-muted">
              {site.name}
              <br />
              {site.offices[0].address}
            </p>
          </section>
        </div>
      </article>
    </>
  );
}
