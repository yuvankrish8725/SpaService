import type { Metadata } from 'next';
import './globals.css';
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

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
    <html
      lang="en"
      className={`dark ${playfair.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
    >
      <body
        className="min-h-screen flex flex-col antialiased"
        style={{
          backgroundColor: 'var(--color-noir)',
          color: 'var(--color-cream)',
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
        }}
      >
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
