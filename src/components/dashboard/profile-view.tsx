'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Bell, ChevronRight, KeyRound, LogOut, Mail, MapPin, Phone, Save, User } from 'lucide-react';
import { authApi } from '@/lib/endpoints';
import { toApiError } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';
import { APP_CUSTOMER_LINKS, APP_MORE_LINKS } from '@/components/layout/app-links';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Select } from '@/components/ui/field';
import { Avatar } from '@/components/ui/misc';

export function ProfileView() {
  const { user, setUser, logout } = useAuth();

  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    company: '',
    line1: '',
    city: 'Chennai',
    pincode: '',
  });
  const [prefs, setPrefs] = useState({ email: true, whatsapp: true });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfile({
      name: user.name,
      phone: user.phone,
      company: user.company ?? '',
      line1: user.address?.line1 ?? '',
      city: user.address?.city ?? 'Chennai',
      pincode: user.address?.pincode ?? '',
    });
    setPrefs({
      email: user.notificationPrefs?.email ?? true,
      whatsapp: user.notificationPrefs?.whatsapp ?? true,
    });
  }, [user]);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    setErrors({});
    try {
      const data = await authApi.updateProfile({
        name: profile.name,
        phone: profile.phone,
        company: profile.company,
        address: { line1: profile.line1, city: profile.city, pincode: profile.pincode },
        notificationPrefs: prefs,
      } as never);
      setUser(data.user);
      toast.success('Profile updated');
    } catch (error) {
      const apiError = toApiError(error);
      setErrors(apiError.details || {});
      toast.error(apiError.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      setErrors({ confirm: 'Passwords do not match' });
      return;
    }

    setSavingPassword(true);
    setErrors({});
    try {
      await authApi.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password updated');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (error) {
      const apiError = toApiError(error);
      setErrors(apiError.details || {});
      toast.error(apiError.message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <Card className="flex flex-wrap items-center gap-4 p-5 sm:p-6">
        <Avatar name={user?.name} src={user?.avatar} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold tracking-tight text-fg">{user?.name}</h1>
          <p className="text-[13.5px] text-fg-muted">{user?.email || user?.phone}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full border border-brand/25 bg-brand-soft px-2.5 py-0.5 text-[10.5px] font-bold tracking-wide text-brand uppercase">
              {user?.role}
            </span>
            <span className="rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-[10.5px] font-semibold text-fg-muted">
              Member since {formatDate(user?.createdAt, 'MMM yyyy')}
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-fg">
          <User className="size-4 text-brand" />
          Personal details
        </h2>

        <form onSubmit={saveProfile} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Input
            label="Full name"
            required
            value={profile.name}
            onChange={(event) => setProfile((p) => ({ ...p, name: event.target.value }))}
            error={errors.name}
          />
          <Input
            label="Phone number"
            required
            type="tel"
            icon={<Phone className="size-4" />}
            value={profile.phone}
            onChange={(event) => setProfile((p) => ({ ...p, phone: event.target.value }))}
            error={errors.phone}
          />
          <Input
            label="Email address"
            value={user?.email ?? ''}
            placeholder="Not added — you sign in with your mobile number"
            disabled
            icon={<Mail className="size-4" />}
            hint={user?.email ? 'Contact support to change your email' : undefined}
            containerClassName="sm:col-span-2"
          />
          <Input
            label="Company"
            placeholder="Optional"
            value={profile.company}
            onChange={(event) => setProfile((p) => ({ ...p, company: event.target.value }))}
            containerClassName="sm:col-span-2"
          />

          <Input
            label="Default service address"
            placeholder="Door no, street, area"
            icon={<MapPin className="size-4" />}
            value={profile.line1}
            onChange={(event) => setProfile((p) => ({ ...p, line1: event.target.value }))}
            containerClassName="sm:col-span-2"
            hint="Pre-fills the address on every new ticket"
          />
          <Select
            label="City"
            value={profile.city}
            onChange={(event) => setProfile((p) => ({ ...p, city: event.target.value }))}
            options={[
              { value: 'Chennai', label: 'Chennai' },
              { value: 'Vellore', label: 'Vellore' },
              { value: 'Other', label: 'Other' },
            ]}
          />
          <Input
            label="Pincode"
            value={profile.pincode}
            onChange={(event) => setProfile((p) => ({ ...p, pincode: event.target.value }))}
          />

          <div className="sm:col-span-2">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-fg">
              <Bell className="size-4 text-brand" />
              Notifications
            </p>
            <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-surface-2 p-3.5">
                <input
                  type="checkbox"
                  checked={prefs.email}
                  onChange={(event) => setPrefs((p) => ({ ...p, email: event.target.checked }))}
                  className="size-4 accent-current"
                />
                <span className="text-[13px] font-semibold text-fg">Email updates</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-surface-2 p-3.5">
                <input
                  type="checkbox"
                  checked={prefs.whatsapp}
                  onChange={(event) => setPrefs((p) => ({ ...p, whatsapp: event.target.checked }))}
                  className="size-4 accent-current"
                />
                <span className="text-[13px] font-semibold text-fg">WhatsApp updates</span>
              </label>
            </div>
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" loading={savingProfile}>
              <Save className="size-4" />
              Save changes
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-fg">
          <KeyRound className="size-4 text-brand" />
          Change password
        </h2>

        <form onSubmit={changePassword} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Input
            label="Current password"
            type="password"
            required
            autoComplete="current-password"
            value={passwords.currentPassword}
            onChange={(event) =>
              setPasswords((p) => ({ ...p, currentPassword: event.target.value }))
            }
            error={errors.currentPassword}
            containerClassName="sm:col-span-2"
          />
          <Input
            label="New password"
            type="password"
            required
            autoComplete="new-password"
            value={passwords.newPassword}
            onChange={(event) => setPasswords((p) => ({ ...p, newPassword: event.target.value }))}
            error={errors.newPassword}
          />
          <Input
            label="Confirm new password"
            type="password"
            required
            autoComplete="new-password"
            value={passwords.confirm}
            onChange={(event) => setPasswords((p) => ({ ...p, confirm: event.target.value }))}
            error={errors.confirm}
          />
          <div className="sm:col-span-2">
            <Button type="submit" variant="secondary" loading={savingPassword}>
              Update password
            </Button>
          </div>
        </form>
      </Card>

      {/* App: this is the Account tab, so the links from the website's menus and
          signing out live here too. */}
      <div className="hidden space-y-4 app:block">
        {user?.role === 'customer' && (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {APP_CUSTOMER_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3.5 text-[14.5px] font-semibold text-fg transition-colors active:bg-surface-2"
                >
                  <item.icon className="size-[18px] text-brand" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="size-4 text-fg-subtle" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {APP_MORE_LINKS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-3.5 text-[14.5px] font-semibold text-fg transition-colors active:bg-surface-2"
              >
                <item.icon className="size-[18px] text-accent" />
                <span className="flex-1">{item.label}</span>
                <ChevronRight className="size-4 text-fg-subtle" />
              </Link>
            </li>
          ))}
        </ul>
        <Button
          variant="outline"
          size="lg"
          onClick={() => void logout()}
          className="w-full rounded-2xl border-danger/40 text-danger hover:border-danger hover:bg-danger-soft hover:text-danger"
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
