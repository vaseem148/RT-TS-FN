'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { contactApi, serviceApi } from '@/lib/endpoints';
import { toApiError } from '@/lib/api';
import { site, whatsappLink } from '@/lib/site';
import type { Service } from '@/lib/types';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Select, Textarea } from '@/components/ui/field';
import { Reveal } from '@/components/ui/misc';

function ContactForm() {
  const searchParams = useSearchParams();
  const product = searchParams.get('product');

  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    serviceInterest: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    serviceApi
      .list()
      .then(setServices)
      .catch(() => {});
  }, []);

  // A product enquiry arrives with the item name in the URL — pre-fill it.
  useEffect(() => {
    if (product) {
      setForm((prev) => ({
        ...prev,
        subject: `Enquiry: ${product}`,
        message: `Hi Renderways, I'd like to know more about "${product}" — availability, price and delivery. Please get in touch.`,
      }));
    }
  }, [product]);

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      const response = await contactApi.submit({
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.subject || 'General enquiry',
        message: form.message,
        serviceInterest: form.serviceInterest,
      });
      toast.success(response.message);
      setDone(true);
    } catch (error) {
      const apiError = toApiError(error);
      setErrors(apiError.details || {});
      toast.error(apiError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <Card className="flex flex-col items-center gap-4 p-10 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-success-soft text-success">
          <CheckCircle2 className="size-7" />
        </span>
        <h2 className="text-xl font-bold text-fg">Enquiry received</h2>
        <p className="max-w-sm text-[14.5px] leading-relaxed text-fg-muted">
          Thanks {form.name.split(' ')[0]} — our team has your details and will call you back
          shortly. For anything urgent, call us directly on {site.phones[0]}.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button href={`tel:${site.primaryPhone}`}>
            <Phone className="size-4" />
            Call now
          </Button>
          <Button variant="outline" onClick={() => setDone(false)}>
            Send another enquiry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <h2 className="text-xl font-bold text-fg">Send us a message</h2>
      <p className="mt-1.5 text-[14px] text-fg-muted">
        Fill this in and we will call you back — usually within a couple of hours during working
        hours.
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <Input
          label="Your name"
          required
          placeholder="Ramesh Kumar"
          value={form.name}
          onChange={update('name')}
          error={errors.name}
        />
        <Input
          label="Phone number"
          required
          type="tel"
          placeholder="98765 43210"
          value={form.phone}
          onChange={update('phone')}
          error={errors.phone}
        />
        <Input
          label="Email address"
          required
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={update('email')}
          error={errors.email}
          containerClassName="sm:col-span-2"
        />
        <Input
          label="Subject"
          placeholder="What is this about?"
          value={form.subject}
          onChange={update('subject')}
          error={errors.subject}
        />
        <Select
          label="Service you need"
          placeholder="Select a service (optional)"
          value={form.serviceInterest}
          onChange={update('serviceInterest')}
          options={services.map((service) => ({ value: service.title, label: service.title }))}
        />
        <Textarea
          label="Your message"
          required
          rows={5}
          placeholder="Tell us what you need — the more detail, the faster we can help."
          value={form.message}
          onChange={update('message')}
          error={errors.message}
          containerClassName="sm:col-span-2"
        />

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <Button type="submit" size="lg" loading={submitting}>
            <Send className="size-4" />
            Send enquiry
          </Button>
          <Button href={whatsappLink()} variant="outline" size="lg">
            <MessageCircle className="size-4" />
            WhatsApp instead
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        breadcrumbs={[{ label: 'Contact' }]}
        title={
          <>
            Let&apos;s sort it out. <span className="text-gradient">Today.</span>
          </>
        }
        description="Call, WhatsApp, email or raise a ticket — whichever suits you. Someone from our team answers every one of them."
      />

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.35fr]">
        <Reveal className="flex flex-col gap-4">
          <Card className="p-6">
            <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
              <Phone className="size-5" />
            </span>
            <h2 className="mt-3.5 text-[16px] font-bold text-fg">Call us</h2>
            <p className="mt-1 text-[13px] text-fg-muted">
              {site.hours} · {site.emergency}
            </p>
            <div className="mt-3 flex flex-col gap-1.5">
              {site.phones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="text-[15px] font-bold text-fg transition-colors hover:text-brand"
                >
                  {phone}
                </a>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
              <Mail className="size-5" />
            </span>
            <h2 className="mt-3.5 text-[16px] font-bold text-fg">Email us</h2>
            <p className="mt-1 text-[13px] text-fg-muted">We reply within one working day.</p>
            <a
              href={`mailto:${site.email}`}
              className="mt-2 inline-block text-[15px] font-bold text-fg transition-colors hover:text-brand"
            >
              {site.email}
            </a>
          </Card>

          {site.offices.map((office) => (
            <Card key={office.city} className="p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
                <MapPin className="size-5" />
              </span>
              <h2 className="mt-3.5 text-[16px] font-bold text-fg">{office.label}</h2>
              <p className="mt-1 text-[13.5px] leading-relaxed text-fg-muted">{office.address}</p>
              <Button
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.mapQuery)}`}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                Get directions
              </Button>
            </Card>
          ))}

          <Card className="p-6">
            <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
              <Clock className="size-5" />
            </span>
            <h2 className="mt-3.5 text-[16px] font-bold text-fg">Working hours</h2>
            <dl className="mt-3 space-y-1.5 text-[13.5px]">
              <div className="flex justify-between">
                <dt className="text-fg-muted">Monday – Saturday</dt>
                <dd className="font-semibold text-fg">9:00 AM – 6:30 PM</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-fg-muted">Sunday</dt>
                <dd className="font-semibold text-fg">Emergency only</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-1.5">
                <dt className="text-fg-muted">Emergency line</dt>
                <dd className="font-semibold text-success">24 / 7</dd>
              </div>
            </dl>
          </Card>
        </Reveal>

        <Reveal delay={0.08}>
          <Suspense fallback={<Card className="h-[600px] animate-pulse" />}>
            <ContactForm />
          </Suspense>
        </Reveal>
      </section>
    </>
  );
}
