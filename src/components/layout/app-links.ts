import { FileText, Info, Laptop, Mail, Package, Search, ShieldCheck, ShoppingBag, ShoppingCart, Ticket } from 'lucide-react';

/** Public pages the app has no navbar for — listed on the home and account screens. */
export const APP_MORE_LINKS = [
  { label: 'Track a ticket', href: '/track', icon: Search },
  { label: 'Shop', href: '/products', icon: ShoppingBag },
  { label: 'About us', href: '/about', icon: Info },
  { label: 'Contact', href: '/contact', icon: Mail },
  { label: 'Privacy policy', href: '/privacy', icon: ShieldCheck },
  { label: 'Terms of service', href: '/terms', icon: FileText },
];

/** A customer's own things — on the account screen and in the app menu. */
export const APP_CUSTOMER_LINKS = [
  { label: 'My tickets', href: '/portal/tickets', icon: Ticket },
  { label: 'My devices', href: '/portal/devices', icon: Laptop },
  { label: 'My orders', href: '/portal/orders', icon: Package },
  { label: 'Your cart', href: '/cart', icon: ShoppingCart },
];
