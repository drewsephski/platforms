import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Platforms',
  description: 'Transform prompts into production-ready websites instantly. Multi-tenant SaaS platform built with Next.js.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        <ThemeProvider defaultTheme="light" storageKey="platforms-ui-theme">
          {children}
          <Toaster position="bottom-right" />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
