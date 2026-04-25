'use server';

import { createClient } from '@/lib/supabase/server';
import { generateSiteContent } from '@/lib/ai';
import { createSite } from '@/lib/sites';
import { redirect } from 'next/navigation';

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

    // Log AI generation
    await supabase.from('ai_generations').insert({
      site_id: site.id,
      prompt,
      model: 'google/gemini-2.0-flash-exp',
      output: content,
      version: '1.0',
    });

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
