import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar signedIn />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
    </>
  );
}
