import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Check, Zap, AlertTriangle } from 'lucide-react';
import { rootDomain } from '@/lib/utils';
import { CreditDisplay } from '@/components/credit-display';
import { SubscriptionActions } from '@/components/subscription-actions';

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
                Upgrade to Pro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-foreground">Pro Plan</span>
                  <span className="text-3xl font-bold">$9<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Unlimited sites</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Custom domains</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>50 AI credits/month</span>
                  </li>
                </ul>
                <form action="/api/checkout" method="POST">
                  <Button type="submit" className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                    Upgrade to Pro
                  </Button>
                </form>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Current Plan Features</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-muted-foreground" />
                    <span>1 site</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-muted-foreground" />
                    <span>Subdomain only</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-muted-foreground" />
                    <span>Basic support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-muted-foreground" />
                    <span>3 AI credits/month</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
