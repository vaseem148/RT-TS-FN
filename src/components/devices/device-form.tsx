'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';
import { deviceApi, type DeviceInput } from '@/lib/endpoints';
import { toApiError } from '@/lib/api';
import { invalidate } from '@/lib/use-api';
import { DEVICE_TYPES } from '@/lib/device-meta';
import type { Device, DeviceType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArtTile } from '@/components/app/service-art';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';

/** Add a device, or edit one (`device` given). Calls `onSaved` with the saved device. */
export function DeviceForm({
  device,
  onSaved,
  onCancel,
}: {
  device?: Device;
  onSaved: (device: Device) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState({
    type: (device?.type ?? 'laptop') as DeviceType,
    name: device?.name ?? '',
    brand: device?.brand ?? '',
    model: device?.model ?? '',
    serialNumber: device?.serialNumber ?? '',
    location: device?.location ?? '',
    purchasedOn: device?.purchasedOn?.slice(0, 10) ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() && !form.brand.trim() && !form.model.trim()) {
      setErrors({ brand: 'Add a brand or model so you can tell it apart' });
      return;
    }
    setSaving(true);
    try {
      const payload: DeviceInput = { ...form, purchasedOn: form.purchasedOn || undefined };
      const saved = device ? await deviceApi.update(device._id, payload) : await deviceApi.create(payload);
      invalidate('devices:');
      toast.success(device ? 'Device updated' : 'Device saved');
      onSaved(saved);
    } catch (error) {
      const apiError = toApiError(error);
      setErrors(apiError.details || {});
      toast.error(apiError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="flex flex-col gap-5">
      <div>
        <p className="text-[13px] font-semibold text-fg">What is it?</p>
        <div className="mt-2.5 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {DEVICE_TYPES.map((type) => {
            const active = form.type === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => set('type', type.value)}
                aria-pressed={active}
                className={cn(
                  'relative flex flex-col items-center gap-1.5 rounded-2xl border p-2.5 text-center transition-all active:scale-95',
                  active ? 'border-brand bg-brand-soft shadow-sm' : 'border-line bg-surface-2 hover:border-brand/40'
                )}
              >
                {active && (
                  <span className="absolute top-1.5 right-1.5 grid size-4.5 animate-[pop_0.3s_ease-out] place-items-center rounded-full bg-brand text-white">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                )}
                <ArtTile kind={type.art} size={44} />
                <span className={cn('text-[11.5px] leading-tight font-bold', active ? 'text-brand' : 'text-fg-muted')}>
                  {type.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Brand"
          placeholder="HP, Dell, Hikvision…"
          value={form.brand}
          onChange={(event) => set('brand', event.target.value)}
          error={errors.brand}
          maxLength={60}
        />
        <Input
          label="Model"
          placeholder="Pavilion 15, Latitude 3540…"
          value={form.model}
          onChange={(event) => set('model', event.target.value)}
          error={errors.model}
          maxLength={80}
        />
        <Input
          label="Serial number"
          hint="On the sticker underneath — speeds up warranty checks"
          value={form.serialNumber}
          onChange={(event) => set('serialNumber', event.target.value)}
          error={errors.serialNumber}
          maxLength={80}
        />
        <Input
          label="Nickname"
          placeholder="e.g. Reception PC"
          value={form.name}
          onChange={(event) => set('name', event.target.value)}
          error={errors.name}
          maxLength={80}
        />
        <Input
          label="Where is it?"
          placeholder="e.g. 2nd floor office"
          value={form.location}
          onChange={(event) => set('location', event.target.value)}
          error={errors.location}
          maxLength={120}
        />
        <Input
          label="Bought on"
          type="date"
          value={form.purchasedOn}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(event) => set('purchasedOn', event.target.value)}
          error={errors.purchasedOn}
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={saving} className="app:bg-linear-90 app:from-accent app:to-brand">
          {device ? 'Save changes' : 'Save device'}
        </Button>
      </div>
    </form>
  );
}
