import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { RequireAuth } from '@/lib/auth';

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[60vh]"><RequireAuth>{children}</RequireAuth></main>
      <Footer />
    </>
  );
}
