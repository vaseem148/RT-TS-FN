import { Hero } from '@/components/home/hero';
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
      <Hero />
      <BrandMarquee />
      <ServicesSection />
      <TicketingSection />
      <StatsSection />
      <WhyUsSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
