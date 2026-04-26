import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Zap, AlertTriangle, ArrowRight } from 'lucide-react';
import { CreditDisplay } from '@/components/credit-display';
import { SubscriptionActions } from '@/components/subscription-actions';
import Link from 'next/link';

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Get subscription status (also check for canceled but not yet ended subscriptions)
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .or('status.eq.active,status.eq.canceled')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const hasActiveSubscription = subscription?.status === 'active';
  const isCanceling = subscription?.cancel_at_period_end === true;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-[clamp(1.5rem,3vw,1.875rem)] font-semibold tracking-tight text-foreground mb-2">
            Billing
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your subscription, AI credits, and payment methods
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* AI Credits Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-500" />
                AI Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CreditDisplay showPurchase={true} />
            </CardContent>
          </Card>

          {/* Subscription Status Card */}
          {hasActiveSubscription && subscription ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  {subscription.plan_tier === 'agency' ? 'Agency Plan' :
                   subscription.plan_tier === 'indie' ? 'Indie Plan' : 'Pro Plan'}
                  {isCanceling && (
                    <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Canceling
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={`text-sm font-medium ${isCanceling ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {isCanceling ? 'Active (canceling at period end)' : 'Active'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-sm text-muted-foreground">
                    {isCanceling ? 'Access ends' : 'Current period ends'}
                  </span>
                  <span className="text-sm">
                    {subscription.current_period_end
                      ? new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-sm text-muted-foreground">Plan tier</span>
                  <span className="text-sm font-medium capitalize">{subscription.plan_tier || 'pro'}</span>
                </div>

                {/* Subscription Management Actions */}
                <div className="pt-2">
                  <SubscriptionActions
                    hasActiveSubscription={hasActiveSubscription}
                    cancelAtPeriodEnd={subscription.cancel_at_period_end}
                    currentPeriodEnd={subscription.current_period_end}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-muted-foreground" />
                  Free Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-sm text-muted-foreground">Sites</span>
                  <span className="text-sm">1 site</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-sm text-muted-foreground">AI Credits</span>
                  <span className="text-sm">5/month</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-muted-foreground">Custom domains</span>
                  <span className="text-sm">—</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Upgrade Section - Only for Free Users */}
        {!hasActiveSubscription && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-muted-foreground" />
                Upgrade Your Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Unlock more sites, custom subdomains, and additional AI credits by upgrading to a paid plan.
              </p>
              <Link href="/pricing">
                <Button className="w-full gap-2">
                  View All Plans
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
