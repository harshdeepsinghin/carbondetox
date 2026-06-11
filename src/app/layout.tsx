import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

export const viewport: Viewport = {
  themeColor: '#16a34a',
};

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'CarbonDetox — AI Sustainability Coach for India',
    template: '%s | CarbonDetox',
  },
  description:
    'Get a personalised carbon health score and daily eco-missions powered by AI. Built for India — reduce your footprint, one habit at a time.',
  keywords: [
    'carbon footprint',
    'sustainability',
    'AI coach',
    'India',
    'eco-friendly',
    'green habits',
    'carbon score',
  ],
  authors: [{ name: 'CarbonDetox' }],
  creator: 'CarbonDetox',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    title: 'CarbonDetox — AI Sustainability Coach',
    description:
      'Personalised carbon health score and daily eco-missions for a greener India.',
    siteName: 'CarbonDetox',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
      >
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            },
          }}
        />
      </body>
    </html>
  );
}
