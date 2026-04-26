import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NewSiteForm } from './new-site-form';

export default async function NewSitePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  return <NewSiteForm userId={user.id} />;
}
