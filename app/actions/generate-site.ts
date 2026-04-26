'use server';

import { createClient } from '@/lib/supabase/server';
import { generateSiteContent } from '@/lib/ai';
import { createSite } from '@/lib/sites';
import { checkRateLimit, getUserRateLimitTier } from '@/lib/rate-limit';
import { hasEnoughCredits, deductCredits, getCreditCost, recordAIGeneration } from '@/lib/credits';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function generateSiteAction(
  prevState: any,
  formData: FormData
) {
  const prompt = formData.get('prompt') as string;
  const subdomain = formData.get('subdomain') as string;
  let template = (formData.get('template') as string) || 'dev';
  const aesthetic = (formData.get('aesthetic') as string) || 'editorial';

  // Map 'auto' template to 'dev' as default
  if (template === 'auto') {
    template = 'dev';
  }

  if (!prompt || !subdomain) {
    return { success: false, error: 'Prompt and subdomain are required' };
  }

  try {
    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'You must be logged in to create a site' };
    }

    // Check rate limit
    const tier = await getUserRateLimitTier(user.id, supabase);
    const userRateLimit = await checkRateLimit(user.id, tier, 'user');

    if (!userRateLimit.allowed) {
      const resetTime = userRateLimit.resetAt.toLocaleTimeString();
      return {
        success: false,
        error: `Rate limit exceeded. You can generate ${userRateLimit.limit} sites per ${userRateLimit.window}. Try again after ${resetTime}.`,
      };
    }

    // Defense in depth: also check IP-based rate limit
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const clientIP = forwardedFor ? forwardedFor.split(',')[0].trim() : null;

    if (clientIP) {
      const ipRateLimit = await checkRateLimit(clientIP, 'free', 'ip');
      if (!ipRateLimit.allowed) {
        return {
          success: false,
          error: 'Too many requests from this location. Please try again later.',
        };
      }
    }

    // Check if user has active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const hasActiveSubscription = !!subscription;

    // If no subscription, check site count (free tier: 1 site max)
    if (!hasActiveSubscription) {
      const { data: existingSites } = await supabase
        .from('sites')
        .select('id')
        .eq('user_id', user.id);

      if (existingSites && existingSites.length >= 1) {
        return { 
          success: false, 
          error: 'Free tier limited to 1 site. Upgrade to Pro for unlimited sites.' 
        };
      }
    }

    // Check AI credits
    const creditCheck = await hasEnoughCredits(user.id, 'full_site');
    if (!creditCheck.hasCredits) {
      const required = creditCheck.required;
      const available = creditCheck.available;
      return {
        success: false,
        error: `Insufficient AI credits. This action requires ${required} credits. You have ${available} credits remaining. Purchase more credits to continue.`,
        needsCredits: true,
        requiredCredits: required,
        availableCredits: available,
      };
    }

    // Deduct credits before generating
    const deducted = await deductCredits(user.id, 'full_site');
    if (!deducted) {
      return {
        success: false,
        error: 'Failed to deduct credits. Please try again.',
      };
    }

    // Generate site content with AI
    const content = await generateSiteContent(prompt, template, aesthetic);

    // Create site in database
    const site = await createSite(user.id, subdomain, content);

    // Create initial version
    await supabase.from('site_versions').insert({
      site_id: site.id,
      content_json: content,
      created_by_user_id: user.id,
      created_by_type: 'ai',
      change_summary: 'Initial AI generation',
    });

    // Log AI generation with credits
    await recordAIGeneration(
      site.id,
      prompt,
      'google/gemini-2.0-flash-exp',
      content,
      'full_site',
      getCreditCost('full_site')
    );

    redirect(`/dashboard/sites/${site.id}/edit`);
  } catch (error: any) {
    // Don't catch redirect errors - they need to be thrown to work
    if (error?.message?.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Error generating site:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to generate site' 
    };
  }
}
