import { createClient } from '@/lib/supabase/server';
import { updateSite } from '@/lib/sites';
import { NextResponse } from 'next/server';
import { SiteContentSchema } from '@/lib/types/site';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { content } = body;

  // Validate content
  const validationResult = SiteContentSchema.safeParse(content);
  if (!validationResult.success) {
    return NextResponse.json(
      { error: 'Invalid content structure' },
      { status: 400 }
    );
  }

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

    // Update site
    const updatedSite = await updateSite(id, content);

    // Create version snapshot
    await supabase.from('site_versions').insert({
      site_id: id,
      content_json: content,
      created_by_user_id: user.id,
      created_by_type: 'user',
      change_summary: 'Manual edit',
    });

    // Clean up old versions (keep last 50)
    await supabase.rpc('cleanup_old_versions', {
      p_site_id: id,
      p_keep_count: 50,
    });

    return NextResponse.json({ success: true, site: updatedSite });
  } catch (error: any) {
    console.error('Error updating site:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update site' },
      { status: 500 }
    );
  }
}
