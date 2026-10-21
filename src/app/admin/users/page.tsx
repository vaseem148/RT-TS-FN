'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Ban, CirclePlus, Mail, Phone, Search, ShieldCheck } from 'lucide-react';
import { userApi } from '@/lib/endpoints';
import { toApiError } from '@/lib/api';
import type { Role, User } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input, Select } from '@/components/ui/field';
import { Avatar, EmptyState, Modal, Pagination, Skeleton } from '@/components/ui/misc';

const ROLE_TABS: { value: string; label: string }[] = [
  { value: '', label: 'Everyone' },
  { value: 'customer', label: 'Customers' },
  { value: 'technician', label: 'Technicians' },
  { value: 'admin', label: 'Admins' },
];

const ROLE_STYLE: Record<Role, string> = {
  admin: 'text-danger bg-danger-soft border-danger/25',
  technician: 'text-accent bg-accent-soft border-accent/25',
  customer: 'text-brand bg-brand-soft border-brand/25',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'technician' as Role,
    skills: '',
  });

  const load = useCallback(async () => {
    setUsers(null);
    try {
      const data = await userApi.list({
        role: role || undefined,
        search: query || undefined,
        page,
        limit: 12,
      });
      setUsers(data.users);
      setPages(data.pagination.pages);
      setTotal(data.pagination.total);
      setError('');
    } catch (err) {
      setError(toApiError(err).message);
      setUsers([]);
    }
  }, [role, query, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const createUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormErrors({});
    try {
      await userApi.create({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
        skills: form.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
      });
      toast.success(`${form.name} added as ${form.role}`);
      setCreateOpen(false);
      setForm({ name: '', email: '', phone: '', password: '', role: 'technician', skills: '' });
      void load();
    } catch (err) {
      const apiError = toApiError(err);
      setFormErrors(apiError.details || {});
      toast.error(apiError.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (target: User) => {
    try {
      if (target.isActive) {
        await userApi.deactivate(target._id);
        toast.success(`${target.name} deactivated`);
      } else {
        await userApi.update(target._id, { isActive: true });
        toast.success(`${target.name} reactivated`);
      }
      void load();
    } catch (err) {
      toast.error(toApiError(err).message);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-fg">Customers &amp; staff</h1>
          <p className="mt-1 text-[13.5px] text-fg-muted">
            {total} account{total === 1 ? '' : 's'} across customers, technicians and admins.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <CirclePlus className="size-4" />
          Add staff member
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setQuery(search.trim());
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-subtle" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, phone or company…"
              className="h-11 w-full rounded-xl border border-line bg-surface pr-4 pl-11 text-sm text-fg outline-none transition-all placeholder:text-fg-subtle focus:border-brand focus:ring-4 focus:ring-brand/12"
              aria-label="Search users"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.value || 'all'}
              onClick={() => {
                setRole(tab.value);
                setPage(1);
              }}
              className={cn(
                'rounded-lg border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors',
                role === tab.value
                  ? 'border-brand bg-brand text-brand-fg'
                  : 'border-line bg-surface text-fg-muted hover:border-brand/45 hover:text-brand'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {!users ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card>
          <EmptyState
            icon="UserSearch"
            title="No accounts found"
            description="Try a different search or role filter."
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((item) => (
            <Card key={item._id} className={cn('p-4', !item.isActive && 'opacity-60')}>
              <div className="flex items-start gap-3">
                <Avatar name={item.name} src={item.avatar} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold text-fg">{item.name}</p>
                  {item.company && (
                    <p className="truncate text-[12px] text-fg-muted">{item.company}</p>
                  )}
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge className={ROLE_STYLE[item.role]}>{item.role}</Badge>
                    {!item.isActive && (
                      <Badge className="border-line bg-surface-2 text-fg-muted">Deactivated</Badge>
                    )}
                    {item.role === 'technician' && (
                      <Badge className="border-line bg-surface-2 text-fg-muted">
                        {item.activeTicketCount ?? 0} active
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3.5 flex flex-col gap-1.5 border-t border-line pt-3.5 text-[12.5px]">
                {item.email && (
                  <a
                    href={`mailto:${item.email}`}
                    className="inline-flex items-center gap-2 truncate text-fg-muted transition-colors hover:text-brand"
                  >
                    <Mail className="size-3.5 shrink-0" />
                    {item.email}
                  </a>
                )}
                <a
                  href={`tel:${item.phone}`}
                  className="inline-flex items-center gap-2 text-fg-muted transition-colors hover:text-brand"
                >
                  <Phone className="size-3.5 shrink-0" />
                  {item.phone}
                </a>
              </div>

              {item.skills && item.skills.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {item.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded border border-line bg-surface-2 px-1.5 py-0.5 text-[10.5px] font-medium text-fg-muted"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3.5 flex items-center justify-between border-t border-line pt-3">
                <span className="text-[11.5px] text-fg-subtle">
                  Joined {formatDate(item.createdAt, 'MMM yyyy')}
                </span>
                <button
                  onClick={() => void toggleActive(item)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-bold transition-colors',
                    item.isActive
                      ? 'text-danger hover:bg-danger-soft'
                      : 'text-success hover:bg-success-soft'
                  )}
                >
                  {item.isActive ? (
                    <>
                      <Ban className="size-3" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="size-3" />
                      Reactivate
                    </>
                  )}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} pages={pages} onChange={setPage} />

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add a staff member"
        description="Technician and admin accounts can only be created here — public signups are always customers."
      >
        <form onSubmit={createUser} className="flex flex-col gap-4">
          <Input
            label="Full name"
            required
            value={form.name}
            onChange={(event) => setForm((p) => ({ ...p, name: event.target.value }))}
            error={formErrors.name}
          />
          <Input
            label="Email address"
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm((p) => ({ ...p, email: event.target.value }))}
            error={formErrors.email}
          />
          <Input
            label="Phone number"
            type="tel"
            required
            value={form.phone}
            onChange={(event) => setForm((p) => ({ ...p, phone: event.target.value }))}
            error={formErrors.phone}
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(event) => setForm((p) => ({ ...p, role: event.target.value as Role }))}
            options={[
              { value: 'technician', label: 'Technician' },
              { value: 'admin', label: 'Admin' },
              { value: 'customer', label: 'Customer' },
            ]}
          />
          {form.role === 'technician' && (
            <Input
              label="Skills"
              placeholder="Chip-level service, CCTV, Networking"
              hint="Comma separated — shown when assigning tickets"
              value={form.skills}
              onChange={(event) => setForm((p) => ({ ...p, skills: event.target.value }))}
            />
          )}
          <Input
            label="Temporary password"
            type="password"
            required
            hint="They can change it after signing in"
            value={form.password}
            onChange={(event) => setForm((p) => ({ ...p, password: event.target.value }))}
            error={formErrors.password}
          />

          <div className="flex gap-2.5">
            <Button type="submit" className="flex-1" loading={saving}>
              Create account
            </Button>
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
