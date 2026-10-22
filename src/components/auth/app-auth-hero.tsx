import Link from 'next/link';
import { Check, ChevronLeft } from 'lucide-react';
import { ArtTile, ServiceArt } from '@/components/app/service-art';
import { Logo } from '@/components/layout/logo';
import { ThemeToggle } from '@/components/layout/theme-toggle';

/**
 * Top of the sign-in and sign-up screens in the app (from the app design
 * prototype): a night-purple scene with drifting aurora, IT hardware floating
 * around a laptop, and two status chips. Hidden on the website.
 */
export function AppAuthHero() {
  return (
    <div
      className="app-hero relative isolate hidden overflow-hidden pt-[calc(var(--safe-top)+0.9rem)] app:block"
      style={{ backgroundColor: '#1A1250' }}
    >
      {/* aurora */}
      <span
        className="rw-aur1 absolute -top-20 -left-28 -z-10 size-[360px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(123,97,255,0.8) 0%, rgba(123,97,255,0) 70%)' }}
        aria-hidden
      />
      <span
        className="rw-aur2 absolute top-10 -right-36 -z-10 size-[380px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(226,24,125,0.55) 0%, rgba(226,24,125,0) 70%)' }}
        aria-hidden
      />
      <span
        className="rw-aur3 absolute top-72 left-14 -z-10 size-80 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,176,32,0.35) 0%, rgba(255,176,32,0) 70%)' }}
        aria-hidden
      />
      <span
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.9), transparent 70%)',
          WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.9), transparent 70%)',
        }}
        aria-hidden
      />

      {/* top bar */}
      <div className="flex items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-1">
          <Link
            href="/welcome"
            replace
            aria-label="Back to welcome"
            className="grid size-10 place-items-center rounded-full text-white transition-transform active:scale-90 active:bg-white/10"
          >
            <ChevronLeft className="size-6" />
          </Link>
          <Logo compact />
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/8 px-2.5 py-1.5 text-[11px] font-bold whitespace-nowrap text-[#D7DAF5]">
            <span className="rw-pulse size-[7px] rounded-full bg-[#34D399]" />
            Chennai · Vellore
          </span>
          <ThemeToggle className="size-9 rounded-full border-white/12 bg-white/8" />
        </div>
      </div>

      {/* scene */}
      <div className="relative mx-auto mt-3 h-[200px] max-w-[390px]" aria-hidden>
        <span className="absolute top-[104px] left-1/2 -mt-[125px] -ml-[125px] size-[250px] rounded-full border border-dashed border-[rgba(215,218,245,0.2)]" />
        <span className="absolute top-[104px] left-1/2 -mt-20 -ml-20 size-40 rounded-full border border-[rgba(215,218,245,0.14)]" />

        <span className="rw-f1 absolute top-[104px] left-1/2 -mt-[54px] -ml-[54px] grid size-[108px] place-items-center rounded-[30px] bg-linear-160 from-white to-[#ECEEFF] shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
          <ServiceArt kind="laptop" size={96} />
        </span>

        <span className="rw-f2 absolute top-[18px] left-7 rounded-[18px] shadow-[0_12px_30px_rgba(0,0,0,0.4)]">
          <ArtTile kind="printer" size={56} />
        </span>
        <span className="rw-f3 absolute top-4 right-[26px] rounded-[18px] shadow-[0_12px_30px_rgba(0,0,0,0.4)]">
          <ArtTile kind="cctv" size={56} />
        </span>
        <span className="rw-f3 absolute top-32 left-5 rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.4)]">
          <ArtTile kind="network" size={50} />
        </span>
        <span className="rw-f2 absolute top-[130px] right-[22px] rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.4)]">
          <ArtTile kind="server" size={50} />
        </span>

        {/* status chips */}
        <span className="rw-f2 absolute top-0 left-24 flex items-center gap-2 rounded-[14px] bg-white/97 py-[7px] pr-[11px] pl-[7px] shadow-[0_10px_26px_rgba(0,0,0,0.35)]">
          <span className="grid size-[26px] place-items-center rounded-full bg-[#1F7A4D] text-white">
            <Check className="size-3.5" strokeWidth={3} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[11px] font-extrabold text-[#241A5E]">Ticket raised</span>
            <span className="text-[10px] text-[#5C5C76]">Laptop repair · on-site</span>
          </span>
        </span>
        <span className="rw-f3 absolute top-[150px] left-1/2 -ml-1.5 flex items-center gap-2 rounded-[14px] bg-white/97 py-[7px] pr-[11px] pl-[7px] shadow-[0_10px_26px_rgba(0,0,0,0.35)]">
          <span className="grid size-[26px] place-items-center rounded-full bg-[#FDEBD8] text-[10px] font-extrabold text-[#9A3412]">
            RW
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[11px] font-extrabold text-[#241A5E]">Technician assigned</span>
            <span className="text-[10px] text-[#5C5C76]">Track every step</span>
          </span>
        </span>
      </div>

      {/* headline */}
      <div className="px-5 pt-0.5 pb-5">
        <p className="text-[24px] leading-[1.12] font-extrabold tracking-[-0.03em] text-white">
          Your IT, fixed at your doorstep.
        </p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-[#B9BCDD]">
          Laptops, desktops, printers, CCTV and networks. Raise a ticket in a minute, track every step.
        </p>
      </div>
    </div>
  );
}
