import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check subscription status
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const isPro = !!subscription;

    // Get or create credits
    const { data: credits, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching credits:', error);
      return NextResponse.json(
        { error: 'Failed to fetch credits' },
        { status: 500 }
      );
    }

    // If no record exists, return default values (5 free credits for new users)
    if (!credits) {
      const monthly = isPro ? 50 : 5;
      return NextResponse.json({
        monthly,
        purchased: 0,
        total: monthly,
        isPro,
      });
    }

    return NextResponse.json({
      monthly: credits.monthly_credits,
      purchased: credits.purchased_credits,
      total: credits.monthly_credits + credits.purchased_credits,
      isPro,
    });
  } catch (error: any) {
    console.error('Error getting credits:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get credits' },
      { status: 500 }
    );
  }
}
