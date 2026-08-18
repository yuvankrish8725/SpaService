import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Serene Haven — Luxury Spa & Holistic Wellness',
  description: 'Experience bespoke therapeutic massages, facials, and body rituals across premier branches. Live therapist availability & instant booking.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-stone-950 text-stone-100 min-h-screen flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-stone-950">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
