import { FileText, Info, Mail, Package, Search, ShieldCheck } from 'lucide-react';

/** Public pages the app has no navbar for — listed on the home and account screens. */
export const APP_MORE_LINKS = [
  { label: 'Track a ticket', href: '/track', icon: Search },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'About us', href: '/about', icon: Info },
  { label: 'Contact', href: '/contact', icon: Mail },
  { label: 'Privacy policy', href: '/privacy', icon: ShieldCheck },
  { label: 'Terms of service', href: '/terms', icon: FileText },
];
