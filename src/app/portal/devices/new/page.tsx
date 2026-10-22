'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { DeviceForm } from '@/components/devices/device-form';

export default function NewDevicePage() {
  const router = useRouter();
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-fg app:hidden">Add a device</h1>
        <p className="mt-1 text-[13.5px] text-fg-muted">
          Save it once — then book a repair in one tap and see every visit we have made for it.
        </p>
      </div>
      <Card className="p-5 sm:p-6">
        <DeviceForm onSaved={(device) => router.replace(`/portal/devices/${device._id}`)} onCancel={() => router.back()} />
      </Card>
    </div>
  );
}
