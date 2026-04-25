import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature')!;

    console.log('🔔 Webhook received:', {
      hasSignature: !!signature,
      signatureLength: signature?.length,
      bodyLength: body.length,
    });

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('✅ Webhook signature verified:', event.type);
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = await createClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;

        console.log('📦 Checkout session completed:', {
          userId,
          subscriptionId: session.subscription,
          customerId: session.customer,
        });

        if (userId && session.subscription) {
          // Create or update subscription record
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          const subData = subscription as any;
          const { error } = await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            stripe_price_id: subscription.items.data[0].price.id,
            status: subscription.status,
            current_period_start: new Date(subData.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subData.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subData.cancel_at_period_end,
          });

          if (error) {
            console.error('❌ Failed to upsert subscription:', error);
          } else {
            console.log('✅ Subscription created successfully for user:', userId);
          }
        } else {
          console.error('❌ Missing userId or subscription in checkout session');
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subData = subscription as any;

        console.log('🔄 Subscription updated:', {
          subscriptionId: subscription.id,
          status: subscription.status,
        });

        // Update by stripe_subscription_id (user_id is in the customer, not subscription metadata)
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subData.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subData.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subData.cancel_at_period_end,
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('❌ Failed to update subscription:', error);
        } else {
          console.log('✅ Subscription updated successfully');
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        console.log('🗑️ Subscription deleted:', subscription.id);

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('❌ Failed to delete subscription:', error);
        } else {
          console.log('✅ Subscription canceled successfully');
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceData = invoice as any;

        console.log('💳 Invoice paid:', {
          invoiceId: invoice.id,
          subscriptionId: invoiceData.subscription,
        });

        if (invoiceData.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoiceData.subscription as string
          );

          const subData = subscription as any;
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_start: new Date(subData.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subData.current_period_end * 1000).toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);

          if (error) {
            console.error('❌ Failed to update subscription from invoice:', error);
          } else {
            console.log('✅ Subscription updated from invoice payment');
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceData = invoice as any;

        console.log('❌ Invoice payment failed:', {
          invoiceId: invoice.id,
          subscriptionId: invoiceData.subscription,
        });

        if (invoiceData.subscription) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
            })
            .eq('stripe_subscription_id', invoiceData.subscription as string);

          if (error) {
            console.error('❌ Failed to mark subscription as past_due:', error);
          } else {
            console.log('✅ Subscription marked as past_due');
          }
        }
        break;
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    console.log('✅ Webhook processed successfully');
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('💥 Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
