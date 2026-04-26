import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getUserSites } from '@/lib/sites';
import { DashboardContent } from './dashboard-content';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  const sites = await getUserSites(user.id);

  return <DashboardContent sites={sites} userId={user.id} />;
}
