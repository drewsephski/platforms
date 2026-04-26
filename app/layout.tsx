import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '@/components/theme-provider';
import { createClient } from '@/lib/supabase/server';
import { Toaster } from 'sonner';
import './globals.css';
import { ConditionalLayout } from '@/components/conditional-layout';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Platforms',
  description: 'Transform prompts into production-ready websites instantly. Multi-tenant SaaS platform built with Next.js.'
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check if user is admin
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    isAdmin = profile?.role === 'admin';
  }

  const userData = user ? { email: user.email ?? null, isAdmin } : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider defaultTheme="light" storageKey="platforms-ui-theme">
          <ConditionalLayout user={userData}>
            {children}
          </ConditionalLayout>
          <Toaster position="bottom-right" />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
