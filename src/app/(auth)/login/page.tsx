'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowRight, Lock, Mail, Smartphone } from 'lucide-react';
import { toApiError } from '@/lib/api';
import { useIsApp } from '@/lib/app-mode';
import { homeFor, useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { Spinner } from '@/components/ui/misc';
import { AuthMethodToggle, type AuthMethod } from '@/components/auth/method-toggle';

// One-click demo sign-in is for local development only — on the live site it
// would hand the admin account to anyone who opens the login page. The list is
// empty in production builds, so the credentials never reach the bundle.
const DEMO_ACCOUNTS =
  process.env.NODE_ENV === 'production'
    ? []
    : [
        { label: 'Customer', email: 'sumaiya@example.com', password: 'demo123' },
        { label: 'Technician', email: 'bala@renderways.in', password: 'tech123' },
        { label: 'Admin', email: 'admin@renderways.in', password: 'admin123' },
      ];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const isApp = useIsApp();

  const [method, setMethod] = useState<AuthMethod>('phone');
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const switchMethod = (next: AuthMethod) => {
    setMethod(next);
    setForm((prev) => ({ ...prev, identifier: '' }));
    setErrors({});
  };

  const submit = async (
    event: React.FormEvent,
    override?: { identifier: string; password: string }
  ) => {
    event.preventDefault();
    const credentials = override ?? form;

    setLoading(true);
    setErrors({});
    try {
      const user = await login(credentials.identifier, credentials.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      // Only same-site paths, so a crafted ?next= can't send people elsewhere.
      const next = searchParams.get('next');
      // In the app a customer's home is the app home screen.
      const home = isApp && user.role === 'customer' ? '/' : homeFor(user.role);
      router.push(next && /^\/(?![/\\])/.test(next) ? next : home);
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
      <h1 className="text-3xl font-extrabold tracking-tight text-fg">Welcome back</h1>
      <p className="mt-2 text-[14.5px] text-fg-muted">
        Sign in to raise tickets, track repairs and see your service history.
      </p>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
        <AuthMethodToggle id="login" value={method} onChange={switchMethod} />
        {method === 'phone' ? (
          <Input
            key="phone"
            label="Mobile number"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            placeholder="98765 43210"
            icon={<Smartphone className="size-4" />}
            value={form.identifier}
            onChange={(event) => setForm((prev) => ({ ...prev, identifier: event.target.value }))}
            error={errors.identifier || errors.email}
          />
        ) : (
          <Input
            key="email"
            label="Email address"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            icon={<Mail className="size-4" />}
            value={form.identifier}
            onChange={(event) => setForm((prev) => ({ ...prev, identifier: event.target.value }))}
            error={errors.identifier || errors.email}
          />
        )}
        <Input
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          icon={<Lock className="size-4" />}
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          error={errors.password}
        />

        <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
          Sign in
          <ArrowRight className="size-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-[14px] text-fg-muted">
        New to Renderways?{' '}
        <Link href="/register" className="font-bold text-brand hover:underline">
          Create an account
        </Link>
      </p>

      {DEMO_ACCOUNTS.length > 0 && (
        <div className="mt-8 rounded-2xl border border-line bg-surface-2/60 p-4">
          <p className="text-[11px] font-bold tracking-wider text-fg-subtle uppercase">
            Demo accounts — one click to sign in
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                disabled={loading}
                onClick={(event) =>
                  void submit(event, { identifier: account.email, password: account.password })
                }
                className="rounded-xl border border-line bg-surface px-3 py-2.5 text-left transition-colors hover:border-brand/45 disabled:opacity-50"
              >
                <span className="block text-[12.5px] font-bold text-fg">{account.label}</span>
                <span className="block truncate text-[10.5px] text-fg-subtle">{account.email}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Spinner className="size-8" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
