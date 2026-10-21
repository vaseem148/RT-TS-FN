import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { PageHeader } from '@/components/layout/page-header';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `The terms under which ${site.name} supplies products and carries out service work.`,
};

const SECTIONS = [
  {
    title: 'Diagnosis and estimates',
    body: 'Diagnosis on repair jobs is free and carries no obligation. Once we know what has failed, we post a written estimate into your ticket. No chargeable work begins until you approve that estimate. If the fault turns out to be different from what we first found, we will revise the estimate and ask you again before continuing.',
  },
  {
    title: 'Repair warranty',
    body: 'Repairs carry a 30-day warranty covering the specific fault we repaired and any part we supplied for it. If the same fault returns within 30 days we will re-do the work at no charge. The warranty does not cover new or unrelated faults, physical or liquid damage occurring after the repair, or work altered by another service provider.',
  },
  {
    title: 'Product warranty',
    body: 'New hardware carries the manufacturer warranty stated on the product listing, handled by us on your behalf. Refurbished units carry the Renderways warranty period shown at the point of sale. Consumables such as batteries and cables are covered only against manufacturing defects.',
  },
  {
    title: 'Data and backups',
    body: 'You are responsible for backing up your data before handing over any device. While we take every reasonable precaution, repair work — particularly on storage devices and motherboards — carries an inherent risk of data loss. Renderways is not liable for data loss on repair jobs. Data recovery jobs are handled separately under a no-recovery-no-fee arrangement.',
  },
  {
    title: 'Uncollected devices',
    body: 'Devices left with us must be collected within 60 days of the ticket being marked resolved. We will remind you by email and WhatsApp before that deadline. After 90 days, uncollected devices may be disposed of to recover storage and handling costs.',
  },
  {
    title: 'On-site visits',
    body: 'On-site charges cover travel within Chennai and Vellore. Please ensure someone authorised is present and that the equipment is accessible. If our technician arrives and cannot begin work for reasons outside our control, a visit charge may apply.',
  },
  {
    title: 'Rentals',
    body: 'Rental hardware remains the property of Renderways Technology. You are responsible for loss, theft or damage beyond fair wear and tear during the rental period. Rentals require a refundable deposit and valid identification. Faulty units are replaced free of charge.',
  },
  {
    title: 'Payment',
    body: 'Payment is due on completion unless agreed otherwise in writing. We accept cash, UPI, card and bank transfer. AMC contracts are billed annually in advance.',
  },
  {
    title: 'Limitation of liability',
    body: 'Our liability for any claim arising out of a service or sale is limited to the amount you paid for that service or product. We are not liable for indirect or consequential losses, including loss of business or profits.',
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        breadcrumbs={[{ label: 'Terms of Service' }]}
        title="Terms of Service"
        description="The terms that apply when we sell you hardware, repair your equipment or install a system."
      />

      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 app:py-6">
        <p className="text-[13px] text-fg-subtle">
          Last updated {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </p>

        <div className="mt-8 flex flex-col gap-8">
          {SECTIONS.map((section, index) => (
            <section key={section.title}>
              <h2 className="text-lg font-bold text-fg">
                <span className="mr-2 font-mono text-sm text-brand">{index + 1}.</span>
                {section.title}
              </h2>
              <p className="mt-2 text-[15px] leading-[1.75] text-fg-muted">{section.body}</p>
            </section>
          ))}

          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-lg font-bold text-fg">Questions?</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">
              Call{' '}
              <a
                href={`tel:${site.primaryPhone}`}
                className="font-semibold text-brand hover:underline"
              >
                {site.phones[0]}
              </a>{' '}
              or email{' '}
              <a href={`mailto:${site.email}`} className="font-semibold text-brand hover:underline">
                {site.email}
              </a>
              . These terms are governed by the laws of India, with jurisdiction in Chennai, Tamil
              Nadu.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}
