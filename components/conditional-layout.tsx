'use client';

import { usePathname } from 'next/navigation';
import { Navbar5 } from '@/components/ui/navbar-5';
import { Footer } from '@/components/navigation';

interface ConditionalLayoutProps {
  children: React.ReactNode;
  user: { email: string | null; isAdmin: boolean } | null;
}

// Convert to match Navbar5 expected type
function convertUserType(user: { email: string | null; isAdmin: boolean } | null) {
  if (!user) return null;
  return {
    email: user.email || undefined,
    isAdmin: user.isAdmin,
  };
}

export function ConditionalLayout({ children, user }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isPreviewRoute = pathname?.startsWith('/preview');

  if (isPreviewRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar5 user={convertUserType(user)} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
