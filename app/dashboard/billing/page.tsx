import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { rootDomain } from '@/lib/utils';

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Get subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  const hasActiveSubscription = !!subscription;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all duration-200">
              <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span>Dashboard</span>
            </Link>
          </div>
          <span className="font-medium text-sm tracking-tight">{rootDomain}</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-[clamp(1.5rem,3vw,1.875rem)] font-semibold tracking-tight text-foreground mb-2">
            Billing
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your subscription and payment methods
          </p>
        </div>

        {hasActiveSubscription && subscription ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Pro Plan - Active
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm font-medium text-emerald-600">Active</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-sm text-muted-foreground">Current period</span>
                <span className="text-sm">
                  {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="text-sm font-medium">$9/month</span>
              </div>
              <div className="pt-4">
                <Button variant="outline" size="sm" disabled>
                  Manage Subscription (Coming Soon)
                </Button>
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
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
