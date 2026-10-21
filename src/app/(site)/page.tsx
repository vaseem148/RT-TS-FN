import { Hero } from '@/components/home/hero';
import { AppHome } from '@/components/home/app-home';
import {
  BrandMarquee,
  CtaSection,
  ServicesSection,
  StatsSection,
  TestimonialsSection,
  TicketingSection,
  WhyUsSection,
} from '@/components/home/sections';

export default function HomePage() {
  return (
    <>
      {/* Both render on the server; the `app` class on <html> picks one, so neither flashes. */}
      <div className="app:hidden">
        <Hero />
        <BrandMarquee />
        <ServicesSection />
        <TicketingSection />
        <StatsSection />
        <WhyUsSection />
        <TestimonialsSection />
        <CtaSection />
      </div>
      <div className="hidden app:block">
        <AppHome />
      </div>
    </>
  );
}
