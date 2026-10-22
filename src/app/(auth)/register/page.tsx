'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowRight, Building2, Lock, Mail, Smartphone, User } from 'lucide-react';
import { toApiError } from '@/lib/api';
import { useIsApp } from '@/lib/app-mode';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { AuthMethodToggle, type AuthMethod } from '@/components/auth/method-toggle';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const isApp = useIsApp();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: '',
  });
  // Signing up with a mobile number needs no email at all.
  const [method, setMethod] = useState<AuthMethod>('phone');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const update =
    (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
      setErrors((prev) => ({ ...prev, [key]: '' }));
    };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const user = await register({
        name: form.name,
        email: method === 'email' ? form.email : undefined,
        phone: form.phone,
        password: form.password,
        company: form.company,
      });
      toast.success(`Welcome to Renderways, ${user.name.split(' ')[0]}!`);
      // In the app, Back from home must not return to the sign-up screen.
      if (isApp) router.replace('/');
      else router.push('/portal');
    } catch (error) {
      const apiError = toApiError(error);
      setErrors(apiError.details || {});
      toast.error(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight text-fg">Create your account</h1>
      <p className="mt-2 text-[14.5px] text-fg-muted">
        Free to join. Raise unlimited service tickets and track every repair in one place.
      </p>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
        <AuthMethodToggle
          id="register"
          value={method}
          onChange={(next) => {
            setMethod(next);
            setErrors({});
          }}
        />

        <Input
          label="Full name"
          required
          autoComplete="name"
          placeholder="Ramesh Kumar"
          icon={<User className="size-4" />}
          value={form.name}
          onChange={update('name')}
          error={errors.name}
        />

        <div className={method === 'email' ? 'grid gap-4 sm:grid-cols-2' : 'grid gap-4'}>
          {method === 'email' && (
            <Input
              label="Email address"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              icon={<Mail className="size-4" />}
              value={form.email}
              onChange={update('email')}
              error={errors.email}
            />
          )}
          <Input
            label="Mobile number"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            placeholder="98765 43210"
            icon={<Smartphone className="size-4" />}
            value={form.phone}
            onChange={update('phone')}
            error={errors.phone}
            hint={
              method === 'phone'
                ? 'You will sign in with this number · WhatsApp updates'
                : 'Used for WhatsApp updates'
            }
          />
        </div>

        <Input
          label="Company"
          placeholder="Optional — for business accounts"
          icon={<Building2 className="size-4" />}
          value={form.company}
          onChange={update('company')}
          error={errors.company}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="At least 6 characters"
            icon={<Lock className="size-4" />}
            value={form.password}
            onChange={update('password')}
            error={errors.password}
          />
          <Input
            label="Confirm password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Repeat password"
            icon={<Lock className="size-4" />}
            value={form.confirmPassword}
            onChange={update('confirmPassword')}
            error={errors.confirmPassword}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          loading={loading}
          className="mt-2 w-full app:bg-linear-90 app:from-accent app:to-brand app:shadow-[0_10px_24px_rgba(75,53,168,0.35)]"
        >
          Create account
          <ArrowRight className="size-4" />
        </Button>

        <p className="text-center text-[12px] leading-relaxed text-fg-subtle">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="text-fg-muted underline hover:text-brand">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-fg-muted underline hover:text-brand">
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <p className="mt-6 text-center text-[14px] text-fg-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
