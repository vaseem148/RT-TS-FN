'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, MessageCircle, Truck } from 'lucide-react';
import { isAppMode } from '@/lib/app-mode';
import { cn } from '@/lib/utils';
import { ArtTile, ServiceArt } from '@/components/app/service-art';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';

const SLIDES = [
  {
    scene: 'doorstep',
    title: 'IT repairs at your doorstep',
    body: 'Laptops, desktops, printers, CCTV and networks. Book an engineer in a minute — free diagnosis, 30-day warranty.',
  },
  {
    scene: 'track',
    title: 'Track every repair, live',
    body: 'See who is coming and when. Every step shows up here and on WhatsApp, so you never chase a call.',
  },
  {
    scene: 'shop',
    title: 'Buy here, we look after it',
    body: 'Computers and accessories delivered and set up, pay on delivery. Your devices and their service history in one place.',
  },
] as const;

type Scene = (typeof SLIDES)[number]['scene'];

/** A white status chip floating over the scene. */
function Chip({
  className,
  icon,
  tone,
  title,
  sub,
}: {
  className: string;
  icon: React.ReactNode;
  tone: string;
  title: string;
  sub: string;
}) {
  return (
    <span
      className={cn(
        'absolute flex items-center gap-2 rounded-[14px] bg-white/97 py-[7px] pr-3 pl-[7px] shadow-[0_10px_26px_rgba(0,0,0,0.35)]',
        className
      )}
    >
      <span className={cn('grid size-[26px] shrink-0 place-items-center rounded-full', tone)}>{icon}</span>
      <span className="flex flex-col leading-tight">
        <span className="text-[11px] font-extrabold whitespace-nowrap text-[#241A5E]">{title}</span>
        <span className="text-[10px] whitespace-nowrap text-[#5C5C76]">{sub}</span>
      </span>
    </span>
  );
}

const TILE_SHADOW = 'absolute rounded-[18px] shadow-[0_12px_30px_rgba(0,0,0,0.4)]';

function DoorstepScene() {
  return (
    <>
      <span className="absolute top-1/2 left-1/2 size-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/20" />
      <span className="absolute top-1/2 left-1/2 size-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/12" />
      <span className="rw-f1 absolute top-1/2 left-1/2 -mt-[58px] -ml-[58px] grid size-[116px] place-items-center rounded-[32px] bg-linear-160 from-white to-[#ECEEFF] shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
        <ServiceArt kind="laptop" size={100} />
      </span>
      <span className={cn(TILE_SHADOW, 'rw-f2 top-[4%] left-[6%]')}>
        <ArtTile kind="desktop" size={56} />
      </span>
      <span className={cn(TILE_SHADOW, 'rw-f3 top-0 right-[8%]')}>
        <ArtTile kind="printer" size={52} />
      </span>
      <span className={cn(TILE_SHADOW, 'rw-f3 bottom-[16%] left-[2%]')}>
        <ArtTile kind="cctv" size={50} />
      </span>
      <span className={cn(TILE_SHADOW, 'rw-f2 right-[3%] bottom-[20%]')}>
        <ArtTile kind="network" size={50} />
      </span>
      <Chip
        className="rw-f1 bottom-0 left-1/2 -translate-x-1/2"
        tone="bg-[#1F7A4D] text-white"
        icon={<Check className="size-3.5" strokeWidth={3} />}
        title="Engineer on the way"
        sub="On-site, carry-in or pickup"
      />
    </>
  );
}

function TrackScene() {
  const steps = [
    { label: 'Ticket raised', sub: 'Laptop not charging', state: 'done' },
    { label: 'Technician assigned', sub: 'On the way to you', state: 'done' },
    { label: 'Repair in progress', sub: 'Live now', state: 'live' },
  ] as const;

  return (
    <>
      <div className="rw-f1 absolute top-1/2 left-1/2 w-[236px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] bg-white p-3.5 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2.5">
          <ArtTile kind="laptop" size={36} />
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-bold text-[#9A98B5]">RW-2026-0142</p>
            <p className="truncate text-[12.5px] font-extrabold text-[#241A5E]">Laptop repair · on-site</p>
          </div>
        </div>
        <ol className="mt-3">
          {steps.map((step, index) => (
            <li key={step.label} className="flex gap-2.5">
              <span className="flex w-5 flex-col items-center">
                <span
                  className={cn(
                    'grid size-5 shrink-0 place-items-center rounded-full text-white',
                    step.state === 'done' ? 'bg-[#1F7A4D]' : 'bg-[#FFB020]'
                  )}
                >
                  {step.state === 'done' ? (
                    <Check className="size-3" strokeWidth={3.5} />
                  ) : (
                    <span className="rw-pulse size-2 rounded-full bg-white" />
                  )}
                </span>
                {index < steps.length - 1 && <span className="min-h-3 w-0.5 flex-1 bg-[#1F7A4D]/35" />}
              </span>
              <span className={cn('flex flex-col leading-tight', index < steps.length - 1 && 'pb-2')}>
                <span className="text-[11.5px] font-extrabold text-[#241A5E]">{step.label}</span>
                <span className={cn('text-[10px]', step.state === 'live' ? 'font-bold text-[#B45309]' : 'text-[#5C5C76]')}>
                  {step.sub}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <Chip
        className="rw-f2 top-0 right-0"
        tone="bg-[#25D366] text-white"
        icon={<MessageCircle className="size-3.5" />}
        title="Update on WhatsApp"
        sub="Every step, as it happens"
      />
      <span className={cn(TILE_SHADOW, 'rw-f3 bottom-[6%] left-[2%]')}>
        <ArtTile kind="charger" size={48} />
      </span>
    </>
  );
}

function ShopScene() {
  return (
    <>
      <div className="absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2 grid-cols-2 items-start gap-3.5">
        <span className="rw-f1 rounded-[20px] shadow-[0_14px_34px_rgba(0,0,0,0.45)]">
          <ArtTile kind="desktop" size={80} />
        </span>
        <span className="rw-f2 mt-5 rounded-[20px] shadow-[0_14px_34px_rgba(0,0,0,0.45)]">
          <ArtTile kind="laptop" size={80} />
        </span>
        <span className="rw-f3 -mt-5 rounded-[20px] shadow-[0_14px_34px_rgba(0,0,0,0.45)]">
          <ArtTile kind="ssd" size={80} />
        </span>
        <span className="rw-f1 rounded-[20px] shadow-[0_14px_34px_rgba(0,0,0,0.45)]">
          <ArtTile kind="keyboard" size={80} />
        </span>
      </div>
      <Chip
        className="rw-f2 top-0 left-0"
        tone="bg-[#FFB020] text-[#241A5E]"
        icon={<Truck className="size-3.5" />}
        title="Delivered & installed"
        sub="Pay on delivery"
      />
      <Chip
        className="rw-f3 right-0 bottom-0"
        tone="bg-[#1F7A4D] text-white"
        icon={<Check className="size-3.5" strokeWidth={3} />}
        title="Added to My devices"
        sub="Book repairs in one tap"
      />
    </>
  );
}

const SCENES: Record<Scene, () => React.JSX.Element> = {
  doorstep: DoorstepScene,
  track: TrackScene,
  shop: ShopScene,
};

/**
 * The app's first screen on a new install: three slides on what the app does,
 * then create an account (or sign in) to go in — see AppGate. The website
 * never shows it.
 */
export default function WelcomePage() {
  const router = useRouter();
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  // Slides move on by themselves until the visitor swipes or taps a dot.
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!isAppMode()) router.replace('/');
  }, [router]);

  const goTo = (index: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
  };

  useEffect(() => {
    if (paused || active >= SLIDES.length - 1) return;
    const timer = setTimeout(() => goTo(active + 1), 4500);
    return () => clearTimeout(timer);
  }, [active, paused]);

  return (
    <div
      className="app-hero relative isolate hidden h-dvh flex-col overflow-hidden app:flex"
      style={{ backgroundColor: '#1A1250' }}
    >
      <span
        className="rw-aur1 absolute -top-24 -left-28 -z-10 size-[380px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(123,97,255,0.75) 0%, rgba(123,97,255,0) 70%)' }}
        aria-hidden
      />
      <span
        className="rw-aur2 absolute top-40 -right-40 -z-10 size-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(226,24,125,0.5) 0%, rgba(226,24,125,0) 70%)' }}
        aria-hidden
      />
      <span
        className="rw-aur3 absolute bottom-10 left-6 -z-10 size-80 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,176,32,0.28) 0%, rgba(255,176,32,0) 70%)' }}
        aria-hidden
      />
      <span
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.9), transparent 60%)',
          WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.9), transparent 60%)',
        }}
        aria-hidden
      />

      <header className="page-enter flex items-center justify-between gap-3 px-5 pt-[calc(var(--safe-top)+1rem)]">
        <Logo />
        <span className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/8 px-2.5 py-1.5 text-[11px] font-bold whitespace-nowrap text-[#D7DAF5]">
          <span className="rw-pulse size-[7px] rounded-full bg-[#34D399]" />
          24/7 support
        </span>
      </header>

      <div
        ref={track}
        onScroll={(event) => {
          const el = event.currentTarget;
          setActive(Math.round(el.scrollLeft / el.clientWidth));
        }}
        onPointerDown={() => setPaused(true)}
        className="scrollbar-none flex flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        aria-roledescription="carousel"
        aria-label="What you can do in the app"
      >
        {SLIDES.map((slide, index) => {
          const SceneArt = SCENES[slide.scene];
          const shown = index === active;
          return (
            <section
              key={slide.scene}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${SLIDES.length}`}
              aria-hidden={!shown}
              className="flex w-full shrink-0 snap-center flex-col justify-center px-6 py-4"
            >
              <div
                className={cn(
                  'relative mx-auto h-[clamp(150px,32dvh,290px)] w-full max-w-[320px] transition-all duration-700 ease-out',
                  shown ? 'scale-100 opacity-100' : 'scale-90 opacity-40'
                )}
                aria-hidden
              >
                <SceneArt />
              </div>
              <div
                className={cn(
                  'mt-[clamp(12px,3.2dvh,28px)] transition-all delay-100 duration-600 ease-out',
                  shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                )}
              >
                <h2 className="text-[27px] leading-[1.1] font-extrabold tracking-[-0.03em] text-white">
                  {slide.title}
                </h2>
                <p className="mt-2.5 text-[14px] leading-relaxed text-[#B9BCDD]">{slide.body}</p>
              </div>
            </section>
          );
        })}
      </div>

      <footer
        className="page-enter px-5 pb-[calc(var(--safe-bottom)+1.1rem)]"
        style={{ animationDelay: '120ms' }}
      >
        <div className="mb-5 flex items-center gap-1.5 px-1">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.scene}
              type="button"
              onClick={() => {
                setPaused(true);
                goTo(index);
              }}
              aria-label={`Show slide ${index + 1}`}
              aria-current={index === active}
              className={cn(
                'h-2 rounded-full transition-all duration-500',
                index === active ? 'w-7 bg-white' : 'w-2 bg-white/30'
              )}
            />
          ))}
        </div>

        <Button
          href="/register"
          size="lg"
          className="w-full rounded-2xl bg-linear-90 from-[#E2187D] to-[#7B61FF] text-white shadow-[0_12px_30px_rgba(226,24,125,0.4)]"
        >
          Create account
          <ArrowRight className="size-4" />
        </Button>
        <Button
          href="/login"
          size="lg"
          variant="outline"
          className="mt-3 w-full rounded-2xl border-white/25 bg-white/8 text-white hover:border-white/50 hover:bg-white/12 hover:text-white"
        >
          I already have an account
        </Button>
        <p className="mt-3.5 text-center text-[11.5px] text-[#9A98C9] [@media(max-height:680px)]:hidden">
          Free to join · takes under a minute
        </p>
      </footer>
    </div>
  );
}
