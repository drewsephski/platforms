import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const hasActiveSubscription = !!subscription;

    return NextResponse.json({ hasActiveSubscription });
  } catch (error: any) {
    console.error('Subscription status error:', error);
    return NextResponse.json({ hasActiveSubscription: false }, { status: 500 });
  }
}
