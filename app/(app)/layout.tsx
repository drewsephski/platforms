import { Navbar5 } from '@/components/ui/navbar-5';
import { Footer } from '@/components/navigation';
import { createClient } from '@/lib/supabase/server';

interface AppLayoutProps {
  children: React.ReactNode;
}

// This layout applies to all routes in the (app) route group
// It includes the main platform navbar and footer
export default async function AppLayout({ children }: AppLayoutProps) {
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

  const userData = user ? { email: user.email ?? undefined, isAdmin } : null;

  return (
    <>
      <Navbar5 user={userData} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
