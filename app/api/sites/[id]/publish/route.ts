import { createClient } from '@/lib/supabase/server';
import { publishSite } from '@/lib/sites';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns the site
    const { data: site } = await supabase
      .from('sites')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!site || site.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Publish site
    const publishedSite = await publishSite(id);

    return NextResponse.json({ success: true, site: publishedSite });
  } catch (error: any) {
    console.error('Error publishing site:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to publish site' },
      { status: 500 }
    );
  }
}
