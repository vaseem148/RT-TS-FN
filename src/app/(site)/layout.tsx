import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { FloatingActions } from '@/components/layout/floating-actions';
import { SiteBottomNav } from '@/components/layout/site-bottom-nav';
import { AppTopBar } from '@/components/layout/app-top-bar';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    // Bottom padding leaves room for the phone tab bar. Inside the Android app
    // the navbar/footer give way to AppTopBar (see the `app:` variant).
    <div className="flex min-h-dvh flex-col pb-28 lg:pb-0 app:lg:pb-28">
      <Navbar />
      <AppTopBar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingActions />
      <SiteBottomNav />
    </div>
  );
}
