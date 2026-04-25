import { redis } from '@/lib/redis';
import { createClient } from '@/lib/supabase/server';
import type { SiteContent } from '@/lib/types/site';

const RESERVED_SUBDOMAINS = [
  'www',
  'admin',
  'api',
  'app',
  'static',
  'cdn',
  'old',
  'new',
  'dev',
  'test',
  'staging',
  'beta',
  'support',
  'help',
  'docs',
] as const;

export function isReservedSubdomain(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.includes(subdomain as any);
}

export function isValidSubdomainFormat(subdomain: string): boolean {
  // 3-32 characters
  if (subdomain.length < 3 || subdomain.length > 32) {
    return false;
  }

  // Must start with a letter
  if (!/^[a-z]/.test(subdomain)) {
    return false;
  }

  // Only lowercase letters, numbers, and hyphens
  if (!/^[a-z0-9-]+$/.test(subdomain)) {
    return false;
  }

  // No leading or trailing hyphens
  if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
    return false;
  }

  // No consecutive hyphens
  if (subdomain.includes('--')) {
    return false;
  }

  return true;
}

export function sanitizeSubdomain(subdomain: string): string {
  return subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
}

export async function getSiteForSubdomain(subdomain: string) {
  const sanitized = sanitizeSubdomain(subdomain);

  // Try Redis first
  const cached = await redis.get(`site:${sanitized}`);
  if (cached) {
    return cached;
  }

  // Fallback to Supabase
  const supabase = await createClient();
  const { data: site, error } = await supabase
    .from('sites')
    .select('*')
    .eq('subdomain', sanitized)
    .eq('status', 'published')
    .single();

  if (error || !site) {
    return null;
  }

  // Cache in Redis for 5 minutes
  await redis.set(`site:${sanitized}`, site, { ex: 300 });

  return site;
}

export async function createSite(userId: string, subdomain: string, content: SiteContent) {
  const sanitized = sanitizeSubdomain(subdomain);

  if (!isValidSubdomainFormat(sanitized)) {
    throw new Error('Invalid subdomain format');
  }

  if (isReservedSubdomain(sanitized)) {
    throw new Error('Subdomain is reserved');
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sites')
    .insert({
      user_id: userId,
      subdomain: sanitized,
      content_json: content,
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      // Unique constraint violation
      throw new Error('Subdomain already taken');
    }
    throw error;
  }

  return data;
}

export async function updateSite(siteId: string, content: SiteContent) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sites')
    .update({
      content_json: content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', siteId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Invalidate Redis cache
  const { data: site } = await supabase
    .from('sites')
    .select('subdomain')
    .eq('id', siteId)
    .single();

  if (site) {
    await redis.del(`site:${site.subdomain}`);
  }

  return data;
}

export async function publishSite(siteId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sites')
    .update({
      status: 'published',
      deployed_at: new Date().toISOString(),
    })
    .eq('id', siteId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Update Redis cache
  const { data: site } = await supabase
    .from('sites')
    .select('subdomain, content_json')
    .eq('id', siteId)
    .single();

  if (site) {
    await redis.set(`site:${site.subdomain}`, site, { ex: 300 });
  }

  return data;
}

export async function getUserSites(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteSite(siteId: string, userId: string) {
  const supabase = await createClient();

  // First get the site to check ownership and get subdomain for cache invalidation
  const { data: site, error: fetchError } = await supabase
    .from('sites')
    .select('subdomain, user_id')
    .eq('id', siteId)
    .single();

  if (fetchError || !site) {
    throw new Error('Site not found');
  }

  if (site.user_id !== userId) {
    throw new Error('Unauthorized');
  }

  // Delete the site
  const { error: deleteError } = await supabase
    .from('sites')
    .delete()
    .eq('id', siteId);

  if (deleteError) {
    throw deleteError;
  }

  // Invalidate Redis cache
  await redis.del(`site:${site.subdomain}`);

  return { success: true };
}
