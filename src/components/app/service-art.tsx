import type { Product, Service } from '@/lib/types';

/**
 * Colour illustrations of IT hardware for the app (from the app design
 * prototype). Each kind has a pastel tint used behind it.
 */

export type ArtKind =
  | 'laptop'
  | 'desktop'
  | 'printer'
  | 'network'
  | 'server'
  | 'cctv'
  | 'ssd'
  | 'ram'
  | 'keyboard'
  | 'mouse'
  | 'charger'
  | 'toner';

export const ART_TINTS: Record<ArtKind, string> = {
  laptop: '#DCEBFF',
  desktop: '#EAE4FF',
  printer: '#FFE8D6',
  network: '#DDF4E8',
  server: '#E3E8F0',
  cctv: '#FFF1C7',
  ssd: '#DDF4E8',
  ram: '#DCEBFF',
  keyboard: '#FFE8D6',
  mouse: '#EAE4FF',
  charger: '#FFF1C7',
  toner: '#E3E8F0',
};

// Service icon names (from the services catalogue) -> illustration.
const SERVICE_ART: Record<string, ArtKind> = {
  Monitor: 'desktop',
  Laptop: 'laptop',
  Cpu: 'ram',
  CircuitBoard: 'ssd',
  HardDrive: 'charger',
  DatabaseBackup: 'server',
  Cctv: 'cctv',
  Video: 'cctv',
  PackageOpen: 'printer',
  ShieldCheck: 'toner',
  Network: 'network',
};

export function artForService(service: Pick<Service, 'icon'>): ArtKind {
  return SERVICE_ART[service.icon] ?? 'laptop';
}

// Whole machines first, so "Laptop (i5 · 8GB RAM)" is a laptop, not memory.
const PRODUCT_WORDS: [RegExp, ArtKind][] = [
  [/laptop|notebook|macbook/i, 'laptop'],
  [/desktop|monitor|projector|\bpc\b|all-in-one/i, 'desktop'],
  [/printer/i, 'printer'],
  [/server|nas/i, 'server'],
  [/cctv|camera|dvr|nvr/i, 'cctv'],
  [/router|switch|wi-?fi|network|cable/i, 'network'],
  [/keyboard/i, 'keyboard'],
  [/mouse/i, 'mouse'],
  [/\bram\b|ddr|memory/i, 'ram'],
  [/ssd|hdd|hard disk|nvme|storage/i, 'ssd'],
  [/toner|cartridge|ink/i, 'toner'],
  [/charger|adapter|smps|psu|\bups\b|battery|power/i, 'charger'],
];

export function artForProduct(product: Pick<Product, 'name' | 'category'>): ArtKind {
  const text = `${product.name} ${product.category}`;
  return PRODUCT_WORDS.find(([pattern]) => pattern.test(text))?.[1] ?? 'desktop';
}

/** The illustration alone, `size` px square. */
export function ServiceArt({ kind, size = 54, className }: { kind: ArtKind; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden className={className}>
      {ART[kind]}
    </svg>
  );
}

/** The illustration on its pastel tile, like the prototype's product art. */
export function ArtTile({
  kind,
  size = 56,
  className,
}: {
  kind: ArtKind;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.22),
        background: ART_TINTS[kind],
        display: 'grid',
        placeItems: 'center',
        flex: 'none',
      }}
    >
      <ServiceArt kind={kind} size={Math.round(size * 0.82)} />
    </span>
  );
}

const ART: Record<ArtKind, React.ReactNode> = {
  laptop: (
    <>
      <rect x="12" y="13" width="40" height="28" rx="3" fill="#2B2D42" />
      <rect x="15" y="16" width="34" height="22" rx="1.5" fill="#4CC9F0" />
      <rect x="18" y="19" width="13" height="9" rx="1" fill="#FFFFFF" />
      <rect x="33" y="19" width="13" height="3.5" rx="1" fill="#FFD166" />
      <rect x="33" y="24.5" width="10" height="3.5" rx="1" fill="#EF476F" />
      <rect x="18" y="30" width="28" height="5" rx="1" fill="#3A86FF" />
      <path d="M5 41h54l-3.5 7h-47z" fill="#CED4DA" />
      <rect x="26" y="41" width="12" height="2.5" rx="1.2" fill="#9AA3AD" />
    </>
  ),
  desktop: (
    <>
      <rect x="4" y="10" width="42" height="29" rx="3" fill="#2B2D42" />
      <rect x="7" y="13" width="36" height="23" rx="1.5" fill="#7B61FF" />
      <circle cx="16" cy="21" r="5" fill="#FFD166" />
      <rect x="24" y="16" width="15" height="3.5" rx="1" fill="#FFFFFF" />
      <rect x="24" y="21.5" width="11" height="3.5" rx="1" fill="#C9F2FF" />
      <rect x="10" y="29" width="30" height="3.5" rx="1" fill="#06D6A0" />
      <path d="M21 39h8l2 7h-12z" fill="#ADB5BD" />
      <rect x="15" y="46" width="20" height="3" rx="1.5" fill="#868E96" />
      <rect x="49" y="16" width="11" height="33" rx="2" fill="#495057" />
      <circle cx="54.5" cy="22" r="1.6" fill="#06D6A0" />
      <rect x="51.5" y="28" width="6" height="1.6" rx="0.8" fill="#868E96" />
      <rect x="51.5" y="31.5" width="6" height="1.6" rx="0.8" fill="#868E96" />
    </>
  ),
  printer: (
    <>
      <rect x="19" y="7" width="26" height="16" rx="1" fill="#FFFFFF" stroke="#CED4DA" />
      <rect x="7" y="20" width="50" height="21" rx="4" fill="#E9ECEF" />
      <rect x="7" y="20" width="50" height="7" rx="3" fill="#495057" />
      <circle cx="13" cy="32" r="1.8" fill="#06D6A0" />
      <rect x="40" y="30" width="12" height="5" rx="1" fill="#343A40" />
      <rect x="13" y="38" width="38" height="3" rx="1" fill="#343A40" />
      <rect x="16" y="40" width="32" height="16" rx="1" fill="#FFFFFF" stroke="#CED4DA" />
      <rect x="19" y="44" width="8" height="3.5" fill="#00B4D8" />
      <rect x="28" y="44" width="8" height="3.5" fill="#EF476F" />
      <rect x="37" y="44" width="8" height="3.5" fill="#FFD166" />
      <rect x="19" y="50" width="22" height="2" fill="#ADB5BD" />
    </>
  ),
  network: (
    <>
      <path d="M21 9.5a15 15 0 0 1 22 0" fill="none" stroke="#3A86FF" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M26.5 14a8 8 0 0 1 11 0" fill="none" stroke="#3A86FF" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="13" y="16" width="3.2" height="17" rx="1.6" fill="#343A40" />
      <rect x="30.4" y="19" width="3.2" height="14" rx="1.6" fill="#343A40" />
      <rect x="47.8" y="16" width="3.2" height="17" rx="1.6" fill="#343A40" />
      <rect x="6" y="31" width="52" height="16" rx="5" fill="#212529" />
      <rect x="6" y="31" width="52" height="4" rx="2" fill="#3D434A" />
      <circle cx="14" cy="41" r="1.9" fill="#06D6A0" />
      <circle cx="21" cy="41" r="1.9" fill="#06D6A0" />
      <circle cx="28" cy="41" r="1.9" fill="#4CC9F0" />
      <circle cx="35" cy="41" r="1.9" fill="#FFD166" />
      <rect x="12" y="47" width="6" height="3" rx="1" fill="#495057" />
      <rect x="46" y="47" width="6" height="3" rx="1" fill="#495057" />
    </>
  ),
  server: (
    <>
      <rect x="10" y="7" width="44" height="15" rx="2.5" fill="#2B2D42" />
      <rect x="10" y="24.5" width="44" height="15" rx="2.5" fill="#343A40" />
      <rect x="10" y="42" width="44" height="15" rx="2.5" fill="#2B2D42" />
      {[10.5, 28, 45.5].map((y) =>
        [14, 21, 28].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="5" height="8" rx="1" fill="#5C6670" />)
      )}
      <circle cx="44" cy="14.5" r="2" fill="#06D6A0" />
      <circle cx="49" cy="14.5" r="2" fill="#4CC9F0" />
      <circle cx="44" cy="32" r="2" fill="#06D6A0" />
      <circle cx="49" cy="32" r="2" fill="#FFD166" />
      <circle cx="44" cy="49.5" r="2" fill="#06D6A0" />
      <circle cx="49" cy="49.5" r="2" fill="#EF476F" />
    </>
  ),
  cctv: (
    <>
      <rect x="50" y="28" width="7" height="26" rx="2" fill="#868E96" />
      <path d="M35 34l7 9h9" fill="none" stroke="#ADB5BD" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <g transform="rotate(-12 28 26)">
        <rect x="7" y="16" width="40" height="19" rx="7" fill="#F8F9FA" stroke="#CED4DA" />
        <rect x="5" y="12.5" width="44" height="6.5" rx="3.2" fill="#DEE2E6" />
        <circle cx="13" cy="26" r="7.5" fill="#212529" />
        <circle cx="13" cy="26" r="4.3" fill="#3A86FF" />
        <circle cx="11.2" cy="24.2" r="1.4" fill="#FFFFFF" />
        <circle cx="41" cy="29" r="1.7" fill="#EF476F" />
      </g>
    </>
  ),
  ssd: (
    <>
      <rect x="8" y="26" width="48" height="14" rx="3" fill="#1F7A4D" />
      <rect x="12" y="29" width="20" height="8" rx="1.5" fill="#2B2D42" />
      <rect x="36" y="29" width="7" height="8" rx="1" fill="#2B2D42" />
      <rect x="45" y="29" width="7" height="8" rx="1" fill="#2B2D42" />
      {[14, 19, 24, 29, 34, 39].map((x) => (
        <rect key={x} x={x} y="40" width="3" height="5" fill="#FFD166" />
      ))}
      <circle cx="52" cy="23" r="2" fill="#FFD166" />
    </>
  ),
  ram: (
    <>
      <rect x="6" y="22" width="52" height="18" rx="2" fill="#3A86FF" />
      {[10, 20, 30, 40].map((x) => (
        <rect key={x} x={x} y="26" width="8" height="10" rx="1" fill="#2B2D42" />
      ))}
      <rect x="8" y="40" width="48" height="4" fill="#FFD166" />
      <rect x="30" y="40" width="4" height="4" fill="#3A86FF" />
    </>
  ),
  keyboard: (
    <>
      <rect x="5" y="19" width="54" height="26" rx="5" fill="#2B2D42" />
      <rect x="10" y="24" width="6" height="5" rx="1" fill="#EF476F" />
      <rect x="18" y="24" width="6" height="5" rx="1" fill="#FFD166" />
      <rect x="26" y="24" width="6" height="5" rx="1" fill="#06D6A0" />
      <rect x="34" y="24" width="6" height="5" rx="1" fill="#4CC9F0" />
      <rect x="42" y="24" width="6" height="5" rx="1" fill="#F8F9FA" />
      <rect x="50" y="24" width="4" height="5" rx="1" fill="#F8F9FA" />
      {[10, 18, 26, 34].map((x) => (
        <rect key={x} x={x} y="31" width="6" height="5" rx="1" fill="#F8F9FA" />
      ))}
      <rect x="42" y="31" width="12" height="5" rx="1" fill="#F8F9FA" />
      <rect x="16" y="38" width="32" height="4" rx="1" fill="#F8F9FA" />
    </>
  ),
  mouse: (
    <>
      <path d="M20 22a12 12 0 0 1 24 0v18a12 12 0 0 1-24 0z" fill="#7B61FF" />
      <path d="M20 22a12 12 0 0 1 12-12v18H20z" fill="#9C8BFF" />
      <rect x="30.5" y="16" width="3" height="8" rx="1.5" fill="#FFFFFF" />
      <path d="M32 10V4" stroke="#2B2D42" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  charger: (
    <>
      <rect x="10" y="22" width="30" height="20" rx="5" fill="#2B2D42" />
      <circle cx="25" cy="32" r="3.5" fill="#06D6A0" />
      <path d="M40 32h8M48 26v12" stroke="#2B2D42" strokeWidth="3" strokeLinecap="round" />
      <path d="M10 32H4" stroke="#2B2D42" strokeWidth="3" strokeLinecap="round" />
      <path d="M34 12l-5 10h6l-5 10" fill="none" stroke="#FFD166" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  toner: (
    <>
      <rect x="8" y="20" width="48" height="22" rx="6" fill="#343A40" />
      <rect x="8" y="26" width="48" height="10" fill="#495057" />
      <circle cx="18" cy="31" r="5" fill="#00B4D8" />
      <circle cx="32" cy="31" r="5" fill="#EF476F" />
      <circle cx="46" cy="31" r="5" fill="#FFD166" />
      <rect x="14" y="42" width="36" height="5" rx="2" fill="#212529" />
    </>
  ),
};
