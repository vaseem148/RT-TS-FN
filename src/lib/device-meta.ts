import type { ArtKind } from '@/components/app/service-art';
import type { Device, DeviceType } from './types';

export const DEVICE_TYPES: { value: DeviceType; label: string; art: ArtKind; category: string }[] = [
  { value: 'laptop', label: 'Laptop', art: 'laptop', category: 'laptop-repair' },
  { value: 'desktop', label: 'Desktop', art: 'desktop', category: 'computer-repair' },
  { value: 'printer', label: 'Printer', art: 'printer', category: 'computer-repair' },
  { value: 'cctv', label: 'CCTV / DVR', art: 'cctv', category: 'cctv-service' },
  { value: 'network', label: 'Router / network', art: 'network', category: 'networking' },
  { value: 'server', label: 'Server / storage', art: 'server', category: 'computer-repair' },
  { value: 'other', label: 'Other', art: 'keyboard', category: 'other' },
];

export function deviceMeta(type: DeviceType) {
  return DEVICE_TYPES.find((entry) => entry.value === type) ?? DEVICE_TYPES[DEVICE_TYPES.length - 1]!;
}

/** "HP Pavilion 15" — what a device is called in lists. */
export function deviceTitle(device: Pick<Device, 'name' | 'brand' | 'model' | 'type'>) {
  return device.name || [device.brand, device.model].filter(Boolean).join(' ') || deviceMeta(device.type).label;
}
