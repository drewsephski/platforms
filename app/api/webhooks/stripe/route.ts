import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { redis } from '@/lib/redis';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { PRICING_PLANS, PricingTier } from '@/lib/pricing';

// Idempotency key TTL: 24 hours (Stripe events can be retried for up to 3 days)
const EVENT_IDEMPOTENCY_TTL = 86400;

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
      console.log('✅ Webhook signature verified:', event.type, 'ID:', event.id);
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Idempotency check: Skip if this event was already processed
    const eventKey = `stripe_webhook:${event.id}`;
    const alreadyProcessed = await redis.get(eventKey);
    if (alreadyProcessed) {
      console.log('⏭️ Event already processed, skipping:', event.id);
      return NextResponse.json({ received: true, idempotent: true });
    }

    const supabase = createServiceRoleClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const tier = session.metadata?.tier as PricingTier;
        const isCreditPurchase = session.metadata?.credit_purchase === 'true';
        const creditsAmount = parseInt(session.metadata?.credits_amount || '0', 10);

        console.log('📦 Checkout session completed:', {
          userId,
          tier,
          subscriptionId: session.subscription,
          customerId: session.customer,
          isCreditPurchase,
          creditsAmount,
        });

        if (!userId) {
          console.error('❌ Missing userId in checkout session');
          break;
        }

        // Handle credit purchase (one-time payment)
        if (isCreditPurchase && creditsAmount > 0) {
          const priceCents = session.amount_total || 500;
          
          const { data: existingCredits } = await supabase
            .from('user_credits')
            .select('purchased_credits')
            .eq('user_id', userId)
            .single();
          
          if (existingCredits) {
            const { error: updateError } = await supabase
              .from('user_credits')
              .update({
                purchased_credits: (existingCredits.purchased_credits || 0) + creditsAmount,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', userId);
            
            if (updateError) {
              console.error('❌ Failed to add purchased credits:', updateError);
            } else {
              console.log(`✅ Added ${creditsAmount} credits to user:`, userId);
            }
          } else {
            const { error: insertError } = await supabase
              .from('user_credits')
              .insert({
                user_id: userId,
                purchased_credits: creditsAmount,
                monthly_credits: 5,
              });
            
            if (insertError) {
              console.error('❌ Failed to create credits record:', insertError);
            } else {
              console.log(`✅ Created credits record with ${creditsAmount} purchased credits`);
            }
          }
          
          const { error: purchaseError } = await supabase
            .from('credit_purchases')
            .insert({
              user_id: userId,
              credits_added: creditsAmount,
              price_cents: priceCents,
              stripe_payment_intent_id: session.payment_intent as string,
            });
          
          if (purchaseError) {
            console.error('❌ Failed to record credit purchase:', purchaseError);
          }
          
          break;
        }

        // Handle subscription signup
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          const subData = subscription as any;
          const planTier = tier || 'indie';
          const plan = PRICING_PLANS[planTier];

          const { error } = await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            stripe_price_id: subscription.items.data[0].price.id,
            status: subscription.status,
            plan_tier: planTier,
            current_period_start: subData.current_period_start ? new Date(subData.current_period_start * 1000).toISOString() : null,
            current_period_end: subData.current_period_end ? new Date(subData.current_period_end * 1000).toISOString() : null,
            cancel_at_period_end: subData.cancel_at_period_end,
          });

          if (error) {
            console.error('❌ Failed to upsert subscription:', error);
          } else {
            console.log('✅ Subscription created successfully for user:', userId, 'tier:', planTier);
            
            const { error: creditsError } = await supabase
              .from('user_credits')
              .upsert({
                user_id: userId,
                monthly_credits: plan.credits,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'user_id' });
            
            if (creditsError) {
              console.error('❌ Failed to upgrade credits:', creditsError);
            } else {
              console.log(`✅ Upgraded user to ${planTier} credits (${plan.credits}/month)`);
            }
          }
        } else {
          console.error('❌ Missing subscription in checkout session (not a credit purchase)');
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
            current_period_start: subData.current_period_start ? new Date(subData.current_period_start * 1000).toISOString() : null,
            current_period_end: subData.current_period_end ? new Date(subData.current_period_end * 1000).toISOString() : null,
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
              current_period_start: subData.current_period_start ? new Date(subData.current_period_start * 1000).toISOString() : null,
              current_period_end: subData.current_period_end ? new Date(subData.current_period_end * 1000).toISOString() : null,
            })
            .eq('stripe_subscription_id', subscription.id);

          if (error) {
            console.error('❌ Failed to update subscription from invoice:', error);
          } else {
            console.log('✅ Subscription updated from invoice payment');
            
            const { data: subRecord } = await supabase
              .from('subscriptions')
              .select('user_id, plan_tier')
              .eq('stripe_subscription_id', subscription.id)
              .single();
            
            if (subRecord?.user_id) {
              const tier = (subRecord.plan_tier || 'indie') as PricingTier;
              const plan = PRICING_PLANS[tier];
              
              const { error: creditsError } = await supabase
                .from('user_credits')
                .update({
                  monthly_credits: plan.credits,
                  last_reset_at: new Date().toISOString(),
                })
                .eq('user_id', subRecord.user_id);
              
              if (creditsError) {
                console.error('❌ Failed to reset monthly credits:', creditsError);
              } else {
                console.log(`✅ Reset monthly credits for ${tier} user:`, subRecord.user_id, `(${plan.credits}/month)`);
              }
            }
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

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const subData = subscription as any;

        console.log('🆕 Subscription created:', {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
        });

        // Try to get user_id from customer metadata
        let userId = null;
        try {
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          userId = (customer as any).metadata?.user_id;
        } catch (e) {
          console.log('Could not retrieve customer metadata');
        }

        if (userId) {
          const { error } = await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            stripe_price_id: subscription.items.data[0].price.id,
            status: subscription.status,
            current_period_start: subData.current_period_start ? new Date(subData.current_period_start * 1000).toISOString() : null,
            current_period_end: subData.current_period_end ? new Date(subData.current_period_end * 1000).toISOString() : null,
            cancel_at_period_end: subData.cancel_at_period_end,
          });

          if (error) {
            console.error('❌ Failed to create subscription from customer.subscription.created:', error);
          } else {
            console.log('✅ Subscription created from customer.subscription.created for user:', userId);
          }
        } else {
          console.log('⚠️ No user_id found in customer metadata, skipping subscription creation');
        }
        break;
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    // Mark event as processed (set before returning to handle retries safely)
    await redis.set(eventKey, 'processed', { ex: EVENT_IDEMPOTENCY_TTL });

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
