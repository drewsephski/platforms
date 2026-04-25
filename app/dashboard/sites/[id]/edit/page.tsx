import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SiteEditor } from './site-editor';

export default async function EditSitePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  const { data: site } = await supabase
    .from('sites')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!site) {
    redirect('/dashboard');
  }

  return <SiteEditor site={site} userId={user.id} />;
}
