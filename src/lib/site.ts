export const site = {
  name: 'Renderways Technology',
  shortName: 'Renderways',
  tagline: "Chennai's trusted partner for cutting-edge IT solutions and security systems",
  description:
    'Computer & laptop sales, chip-level and board-level service, CCTV installation, hard disk data recovery and IT rentals across Chennai and Vellore — with live ticket tracking.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',

  email: 'support@renderways.in',
  phones: ['+91 73581 89215', '+91 95430 95480', '+91 81898 80681', '+91 90081 80476'],
  primaryPhone: '+917358189215',
  whatsapp: '917358189215',

  hours: 'Monday – Saturday · 9:00 AM – 6:30 PM',
  emergency: '24/7 emergency call service',

  offices: [
    {
      label: 'Head Office',
      city: 'Chennai',
      address: 'Maduravoyal, Chennai, Tamil Nadu – 600095',
      mapQuery: 'Maduravoyal, Chennai, Tamil Nadu 600095',
    },
    {
      label: 'Branch Office',
      city: 'Vellore',
      address: 'Katpadi, Vellore, Tamil Nadu – 632006',
      mapQuery: 'Katpadi, Vellore, Tamil Nadu 632006',
    },
  ],

  nav: [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Products', href: '/products' },
    { label: 'Track Ticket', href: '/track' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],

  social: {
    facebook: 'https://facebook.com/renderways',
    instagram: 'https://instagram.com/renderways',
    linkedin: 'https://linkedin.com/company/renderways',
    youtube: 'https://youtube.com/@renderways',
  },
} as const;

export const whatsappLink = (message = "Hi Renderways, I'd like to enquire about your services.") =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
