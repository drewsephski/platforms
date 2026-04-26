import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getCreditBalance } from '@/lib/credits';
import type { PricingTier } from '@/lib/pricing';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ hasActiveSubscription: false }, { status: 401 });
    }

    // Check for active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, plan_tier')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const hasActiveSubscription = !!subscription;
    const tier = (subscription?.plan_tier || 'free') as PricingTier;

    // Get credit balance
    const creditBalance = await getCreditBalance(user.id);

    return NextResponse.json({ 
      hasActiveSubscription,
      tier,
      credits: creditBalance
    });
  } catch (error: any) {
    console.error('Subscription status error:', error);
    return NextResponse.json({ hasActiveSubscription: false, tier: 'free' }, { status: 500 });
  }
}
