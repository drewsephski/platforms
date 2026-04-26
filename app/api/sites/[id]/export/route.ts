import { createClient } from '@/lib/supabase/server';
import { generateStandaloneHTML } from '@/lib/export-site';
import { createZip, sanitizeFilename } from '@/lib/zip';
import { NextResponse } from 'next/server';

/**
 * GET /api/sites/[id]/export
 * Export a site as a standalone ZIP file containing HTML and CSS
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch site data with ownership verification
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('id, subdomain, content_json, user_id')
      .eq('id', id)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // Verify user owns the site
    if (site.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Generate standalone HTML
    const html = generateStandaloneHTML(site.content_json, site.id);

    // Create ZIP with HTML file
    const zipContent = await createZip({
      'index.html': html,
    });

    // Generate safe filename from subdomain
    const filename = `${sanitizeFilename(site.subdomain)}-site.zip`;

    // Return ZIP as downloadable file using Blob
    // Convert Node Buffer to ArrayBuffer for browser compatibility
    const zipArrayBuffer = zipContent.buffer.slice(
      zipContent.byteOffset,
      zipContent.byteOffset + zipContent.byteLength
    ) as ArrayBuffer;
    const zipBlob = new Blob([zipArrayBuffer], { type: 'application/zip' });

    return new NextResponse(zipBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export site' },
      { status: 500 }
    );
  }
}
