'use client';

import { useState, useActionState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, ExternalLink, Edit, LayoutGrid, Trash2, Loader2, AlertCircle, Check, Crown, Zap, Coins } from 'lucide-react';
import { deleteSiteAction } from '@/app/actions';
import { protocol, rootDomain, getSiteUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';
import TextReveal from '@/components/ui/text-reveal';
import { PlatformsLogo } from '@/components/platforms-logo';

type Site = {
  id: string;
  subdomain: string;
  status: string;
  content_json: any;
  created_at: string;
  updated_at: string;
};

type SubscriptionStatus = {
  hasActiveSubscription: boolean;
  tier?: 'free' | 'indie' | 'pro' | 'agency';
  credits?: {
    totalAvailable: number;
    monthlyCredits: number;
    purchasedCredits: number;
  };
};

function Badge({ variant, label }: { variant: 'published' | 'draft' | 'indie' | 'pro' | 'agency' | 'free'; label?: string }) {
  const icon = variant === 'published' || variant === 'draft' ? (
    <span className={cn(
      "w-1.5 h-1.5 rounded-full mr-1.5",
      variant === 'published' ? "bg-emerald-500" : "bg-amber-500"
    )} />
  ) : variant === 'agency' ? (
    <Crown className="w-3 h-3 mr-1.5 text-purple-500" />
  ) : variant === 'pro' ? (
    <Crown className="w-3 h-3 mr-1.5 text-amber-500" />
  ) : variant === 'indie' ? (
    <Zap className="w-3 h-3 mr-1.5 text-blue-500" />
  ) : (
    <Zap className="w-3 h-3 mr-1.5 text-muted-foreground" />
  );

  const text = label || (variant === 'published' ? 'Published' : variant === 'draft' ? 'Draft' : variant === 'agency' ? 'Agency' : variant === 'pro' ? 'Pro' : variant === 'indie' ? 'Indie' : 'Free');

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted/40 text-muted-foreground border border-border/60">
      {icon}
      {text}
    </span>
  );
}

type DeleteState = {
  error?: string;
  success?: string;
};

function Toast({ type, message }: { type: 'error' | 'success'; message: string }) {
  return (
    <div 
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg shadow-black/5 animate-slide-in",
        type === 'error' 
          ? "bg-destructive/10 border border-destructive/20" 
          : "bg-emerald-50 border border-emerald-200"
      )}
    >
      {type === 'error' ? (
        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
      ) : (
        <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
      )}
      <p className={cn(
        "text-sm",
        type === 'error' ? "text-destructive" : "text-emerald-900"
      )}>
        {message}
      </p>
    </div>
  );
}

function DeleteSiteDialog({
  site,
  isOpen,
  onClose,
  userId,
}: {
  site: Site | null;
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}) {
  const [state, action, isPending] = useActionState<DeleteState, FormData>(
    deleteSiteAction,
    {}
  );

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  if (!site) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            Delete Site
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{site.subdomain}</strong>? This action cannot be undone. All site data will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
          <input type="hidden" name="siteId" value={site.id} />
          <input type="hidden" name="userId" value={userId} />
          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isPending}
              className="gap-2"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete Site
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UpgradeDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="w-5 h-5 text-amber-500" />
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription className="text-base">
            You've reached the 1 site limit on the free plan. Upgrade to unlock more sites, custom subdomains, and additional credits.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-foreground">Indie Plan</span>
              <span className="text-2xl font-bold">$5<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>50 credits/month</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>1 custom subdomain</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>All templates</span>
              </li>
            </ul>
          </div>
        </div>
        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Maybe Later
          </Button>
          <Button
            onClick={() => window.location.href = '/pricing'}
            className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Zap className="w-4 h-4" />
            View Plans
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DashboardContent({ sites, userId }: { sites: Site[]; userId: string }) {
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  // Check subscription status on mount
  useEffect(() => {
    async function checkSubscription() {
      try {
        const response = await fetch('/api/subscription/status');
        const data = await response.json();
        setHasSubscription(data.hasActiveSubscription);
        setSubscriptionStatus({
          hasActiveSubscription: data.hasActiveSubscription,
          tier: data.tier || 'free',
          credits: data.credits
        });
      } catch (error) {
        console.error('Failed to check subscription:', error);
        setSubscriptionStatus({ hasActiveSubscription: false, tier: 'free' });
      } finally {
        setIsLoadingSubscription(false);
      }
    }
    checkSubscription();
  }, []);

  const handleDeleteClick = (site: Site) => {
    setSiteToDelete(site);
    setShowDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDeleteDialog(false);
    setSiteToDelete(null);
  };

  const handleCreateClick = () => {
    // Check if user has hit the 1 site limit (free tier)
    if (!hasSubscription && sites.length >= 1) {
      setShowUpgradeDialog(true);
    } else {
      window.location.href = '/dashboard/new';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LayoutGrid className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dashboard</span>
            </div>
            <div className="text-[clamp(1.5rem,3vw,1.875rem)] font-semibold tracking-tight text-foreground">
              <TextReveal word="Your Sites" className="!border-none !bg-transparent !p-0 !min-h-auto" showButton={false} tag="h1" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {sites.length === 0 
                ? 'No sites yet — create your first one' 
                : `Managing ${sites.length} site${sites.length === 1 ? '' : 's'}`
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isLoadingSubscription && subscriptionStatus && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant={subscriptionStatus.tier || 'free'} />
                {subscriptionStatus.credits && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 border border-border/60">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-medium">{subscriptionStatus.credits.totalAvailable}</span>
                    <span className="text-muted-foreground text-xs">credits</span>
                  </div>
                )}
              </div>
            )}
            <Button onClick={handleCreateClick} disabled={isLoadingSubscription} className="h-10 group transition-all duration-200">
              <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
              Create New Site
            </Button>
          </div>
        </div>

        {/* Empty state */}
        {sites.length === 0 ? (
          <Card className="border-dashed border-border/60 bg-muted/20 p-12 text-center animate-fade-in delay-75">
            <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <PlatformsLogo className="w-16 h-16 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium text-foreground mb-2">No sites yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
              Create your first AI-powered site in seconds. Just describe what you want.
            </p>
            <Link href="/dashboard/new">
              <Button className="group transition-all duration-200">
                <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
                Create Your First Site
              </Button>
            </Link>
          </Card>
        ) : (
          /* Site grid */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((site, index) => (
              <Card 
                key={site.id} 
                className="group overflow-hidden border-border/60 transition-all duration-200 hover:border-border hover:shadow-sm animate-fade-in"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <CardHeader className="pb-3 pt-5 px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base font-medium truncate">
                        {site.subdomain}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        /s/{site.subdomain}
                      </p>
                    </div>
                    <Badge variant={site.status === 'published' ? 'published' : 'draft'} />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-5 px-5">
                  <div className="flex gap-2">
                    <Link href={`/dashboard/sites/${site.id}/edit`} className="flex-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full h-9 text-xs font-medium transition-all duration-200 hover:bg-secondary/50"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1.5" />
                        Edit
                      </Button>
                    </Link>
                    {site.status === 'published' && (
                      <a
                        href={getSiteUrl(site.subdomain)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 group/button"
                        >
                          <ExternalLink className="w-3.5 h-3.5 transition-all duration-200 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
                        </Button>
                      </a>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteClick(site)}
                      className="h-9 w-9 p-0 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <DeleteSiteDialog
        site={siteToDelete}
        isOpen={showDeleteDialog}
        onClose={handleCloseDialog}
        userId={userId}
      />
      <UpgradeDialog
        isOpen={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
      />
    </div>
  );
}
