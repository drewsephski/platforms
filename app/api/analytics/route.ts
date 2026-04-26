import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

interface AnalyticsPayload {
  site_id: string;
  path?: string;
  referrer?: string;
}

/**
 * POST /api/analytics
 * Fire-and-forget analytics ingestion endpoint
 * Accepts analytics data from client-side beacons in rendered sites
 */
export async function POST(request: Request) {
  try {
    const body = await request.json() as AnalyticsPayload;
    const { site_id, path = '/', referrer } = body;

    if (!site_id) {
      return NextResponse.json(
        { error: 'site_id is required' },
        { status: 400 }
      );
    }

    // Get request metadata
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const forwardedFor = headersList.get('x-forwarded-for');
    const country = headersList.get('x-vercel-ip-country') ||
      headersList.get('cf-ipcountry') ||
      null;

    // Derive device type from user agent
    const device_type = getDeviceType(userAgent);

    // Get client IP (first in chain)
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : null;

    // Use service role client to bypass RLS for anonymous tracking
    const supabase = createServiceRoleClient();

    // Insert analytics record
    const { error } = await supabase.from('site_analytics').insert({
      site_id,
      path: path.substring(0, 500), // Limit path length
      referrer: referrer ? referrer.substring(0, 500) : null,
      country,
      device_type,
    });

    if (error) {
      console.error('Analytics ingestion error:', error);
      // Don't expose internal errors to client
      return NextResponse.json(
        { error: 'Failed to record analytics' },
        { status: 500 }
      );
    }

    // Return minimal response for fire-and-forget
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Analytics endpoint error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

/**
 * Derive device type from user agent string
 */
function getDeviceType(userAgent: string): string | null {
  const ua = userAgent.toLowerCase();

  if (/mobile|android|iphone|ipad|ipod|windows phone/i.test(ua)) {
    if (/ipad|tablet|android(?!.*mobile)/i.test(ua)) {
      return 'tablet';
    }
    return 'mobile';
  }

  if (/tablet|ipad/i.test(ua)) {
    return 'tablet';
  }

  if (/bot|crawler|spider|crawling/i.test(ua)) {
    return 'bot';
  }

  return 'desktop';
}

/**
 * OPTIONS handler for CORS preflight
 * Allows cross-origin requests from any domain (sites can be on custom domains)
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
