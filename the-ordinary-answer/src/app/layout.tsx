import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Ordinary Answer — Personalized Skincare Quiz',
  description:
    'Take our 2-minute skincare quiz and get a personalized routine using The Ordinary products. Ingredient conflict checking included.',
  keywords: [
    'The Ordinary',
    'skincare quiz',
    'personalized skincare',
    'skincare routine',
    'ingredient conflicts',
  ],
  openGraph: {
    title: 'The Ordinary Answer — Personalized Skincare Quiz',
    description: 'Get your personalized skincare routine in 2 minutes.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-brand-cream font-sans antialiased">
        <div className="relative min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
