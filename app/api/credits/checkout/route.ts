import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Price ID for credit pack ($5 for 10 credits)
const CREDIT_PACK_PRICE_ID = (process.env.STRIPE_CREDIT_PACK_PRICE_ID || '').trim();

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!CREDIT_PACK_PRICE_ID) {
      return NextResponse.json(
        { error: 'Credit purchase is not configured' },
        { status: 500 }
      );
    }

    // Get or create Stripe customer
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
    }

    // Create checkout session for credit purchase (one-time payment)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: CREDIT_PACK_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?credits=purchased`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?credits=canceled`,
      metadata: {
        user_id: user.id,
        credit_purchase: 'true',
        credits_amount: '10',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Credit checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
