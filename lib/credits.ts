import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { PRICING_PLANS, PricingTier } from '@/lib/pricing';

export type GenerationType = 'full_site' | 'section_edit' | 'content_refresh';

export const CREDIT_COSTS: Record<GenerationType, number> = {
  full_site: 1,
  section_edit: 1,
  content_refresh: 1,
};

export interface CreditBalance {
  monthlyCredits: number;
  purchasedCredits: number;
  totalAvailable: number;
  freeTierUsed: number;
  lastResetAt: string;
}

/**
 * Get the credit cost for a generation type
 */
export function getCreditCost(type: GenerationType): number {
  return CREDIT_COSTS[type] ?? 1;
}

/**
 * Get user's current credit balance
 */
export async function getCreditBalance(userId: string): Promise<CreditBalance | null> {
  const supabase = createServiceRoleClient();
  
  // Get or create user credits record
  const { data: credits, error } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching credits:', error);
    return null;
  }
  
  // If no record exists, create one
  if (!credits) {
    // Check user's subscription tier
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_tier')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    
    const tier = (subscription?.plan_tier || 'free') as PricingTier;
    const monthlyCredits = PRICING_PLANS[tier].credits;
    
    const { data: newCredits, error: insertError } = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        monthly_credits: monthlyCredits,
        purchased_credits: 0,
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating credits:', insertError);
      return null;
    }
    
    return {
      monthlyCredits: newCredits.monthly_credits,
      purchasedCredits: newCredits.purchased_credits,
      totalAvailable: newCredits.monthly_credits + newCredits.purchased_credits,
      freeTierUsed: newCredits.free_tier_used,
      lastResetAt: newCredits.last_reset_at,
    };
  }
  
  return {
    monthlyCredits: credits.monthly_credits,
    purchasedCredits: credits.purchased_credits,
    totalAvailable: credits.monthly_credits + credits.purchased_credits,
    freeTierUsed: credits.free_tier_used,
    lastResetAt: credits.last_reset_at,
  };
}

/**
 * Check if user has enough credits for an operation
 */
export async function hasEnoughCredits(
  userId: string,
  generationType: GenerationType
): Promise<{ hasCredits: boolean; required: number; available: number }> {
  const balance = await getCreditBalance(userId);
  const required = getCreditCost(generationType);
  
  if (!balance) {
    return { hasCredits: false, required, available: 0 };
  }
  
  return {
    hasCredits: balance.totalAvailable >= required,
    required,
    available: balance.totalAvailable,
  };
}

/**
 * Deduct credits from user's balance
 * Returns true if successful, false if insufficient credits
 */
export async function deductCredits(
  userId: string,
  generationType: GenerationType
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const amount = getCreditCost(generationType);
  
  // Call the database function to deduct credits
  const { data: success, error } = await supabase.rpc('deduct_credits', {
    user_uuid: userId,
    amount,
    generation_type: generationType,
  });
  
  if (error) {
    console.error('Error deducting credits:', error);
    return false;
  }
  
  return success ?? false;
}

/**
 * Add purchased credits to user's account
 */
export async function addPurchasedCredits(
  userId: string,
  creditsToAdd: number,
  priceCents: number,
  stripePaymentIntentId: string
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  
  // Start a transaction
  const { error: creditError } = await supabase.rpc('add_purchased_credits', {
    user_uuid: userId,
    credits_to_add: creditsToAdd,
  });
  
  if (creditError) {
    // Fallback: manual update if RPC doesn't exist yet
    const { data: current } = await supabase
      .from('user_credits')
      .select('purchased_credits')
      .eq('user_id', userId)
      .single();
    
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        purchased_credits: (current?.purchased_credits ?? 0) + creditsToAdd,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
    
    if (updateError) {
      console.error('Error adding credits:', updateError);
      return false;
    }
  }
  
  // Record the purchase
  const { error: purchaseError } = await supabase
    .from('credit_purchases')
    .insert({
      user_id: userId,
      credits_added: creditsToAdd,
      price_cents: priceCents,
      stripe_payment_intent_id: stripePaymentIntentId,
    });
  
  if (purchaseError) {
    console.error('Error recording purchase:', purchaseError);
    // Don't fail - credits were added
  }
  
  return true;
}

/**
 * Record an AI generation with credit tracking
 */
export async function recordAIGeneration(
  siteId: string,
  prompt: string,
  model: string,
  output: any,
  generationType: GenerationType,
  creditsUsed: number
) {
  const supabase = createServiceRoleClient();
  
  const { error } = await supabase.from('ai_generations').insert({
    site_id: siteId,
    prompt,
    model,
    output,
    version: '1.0',
    credits_used: creditsUsed,
    generation_type: generationType,
  });
  
  if (error) {
    console.error('Error recording AI generation:', error);
  }
}

/**
 * Get credit usage stats for a user
 */
export async function getCreditUsageStats(userId: string, days: number = 30) {
  const supabase = createServiceRoleClient();
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  const { data: generations, error } = await supabase
    .from('ai_generations')
    .select('generation_type, credits_used, created_at')
    .eq('site_id', userId) // Note: site_id is used for user lookup in the join
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching usage stats:', error);
    return null;
  }
  
  // We need to join with sites to get user_id
  const { data: userGenerations, error: joinError } = await supabase
    .from('ai_generations')
    .select(`
      generation_type,
      credits_used,
      created_at,
      sites!inner(user_id)
    `)
    .eq('sites.user_id', userId)
    .gte('created_at', since.toISOString());
  
  if (joinError) {
    console.error('Error fetching user generations:', joinError);
    return null;
  }
  
  const stats = {
    totalUsed: 0,
    byType: {} as Record<GenerationType, { count: number; credits: number }>,
    recent: userGenerations?.slice(0, 10) || [],
  };
  
  userGenerations?.forEach((gen: any) => {
    const type = gen.generation_type as GenerationType;
    stats.totalUsed += gen.credits_used || 1;
    
    if (!stats.byType[type]) {
      stats.byType[type] = { count: 0, credits: 0 };
    }
    stats.byType[type].count++;
    stats.byType[type].credits += gen.credits_used || 1;
  });
  
  return stats;
}

/**
 * Reset monthly credits for all users (call this via cron job)
 */
export async function resetMonthlyCredits(): Promise<void> {
  const supabase = createServiceRoleClient();
  
  const { error } = await supabase.rpc('reset_monthly_credits');
  
  if (error) {
    console.error('Error resetting credits:', error);
  }
}
