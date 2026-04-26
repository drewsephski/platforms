'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Loader2, ExternalLink, ArrowLeft, AlertCircle, Check } from 'lucide-react';
import Link from 'next/link';
import { deleteSubdomainAction } from '@/app/actions';
import { rootDomain, protocol, getSiteUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';
import TextReveal from '@/components/ui/text-reveal';
import { PlatformsLogo } from '@/components/platforms-logo';

type Site = {
  subdomain: string;
  emoji: string;
  createdAt: number;
};

type DeleteState = {
  error?: string;
  success?: string;
};

function DashboardHeader({ siteCount }: { siteCount: number }) {
  return (
    <div className="mb-10 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Link
          href={`${protocol}://${rootDomain}`}
          className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span>Back to {rootDomain}</span>
        </Link>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <PlatformsLogo className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Admin
            </span>
          </div>
          <div className="text-[clamp(1.75rem,4vw,2.25rem)] font-semibold tracking-tight text-foreground">
            <TextReveal word="Site Management" className="!border-none !bg-transparent !p-0 !min-h-auto" showButton={false} tag="h1" />
          </div>
          <p className="mt-1.5 text-muted-foreground">
            {siteCount === 0 
              ? "No sites created yet" 
              : `Managing ${siteCount} site${siteCount === 1 ? '' : 's'}`
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <a
            href={`${protocol}://${rootDomain}`}
            className="group inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-secondary/50 transition-all duration-200"
          >
            <span>Visit platform</span>
            <ExternalLink className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

function SiteCard({
  site,
  action,
  isPending,
  index
}: {
  site: Site;
  action: (formData: FormData) => void;
  isPending: boolean;
  index: number;
}) {
  const fullUrl = getSiteUrl(site.subdomain);
  
  return (
    <Card 
      className={cn(
        "group overflow-hidden border-border/60 transition-all duration-200",
        "hover:border-border hover:shadow-sm hover:shadow-black/[0.02]",
        "animate-fade-in"
      )}
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <CardHeader className="pb-3 pt-5 px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">
              {site.emoji}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base font-medium truncate">
                {site.subdomain}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(site.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          <form action={action} className="flex-shrink-0">
            <input type="hidden" name="subdomain" value={site.subdomain} />
            <Button
              variant="ghost"
              size="icon"
              type="submit"
              disabled={isPending}
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 pb-5 px-5">
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
        >
          <span className="truncate">{fullUrl.replace(/^https?:\/\//, '')}</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-200" />
        </a>
      </CardContent>
    </Card>
  );
}

function SiteGrid({
  sites,
  action,
  isPending
}: {
  sites: Site[];
  action: (formData: FormData) => void;
  isPending: boolean;
}) {
  if (sites.length === 0) {
    return (
      <Card className="border-dashed border-border/60 bg-muted/20">
        <CardContent className="py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
            <PlatformsLogo className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium text-foreground mb-1">
            No sites yet
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Create your first site from the main page to get started.
          </p>
          <Link
            href={`${protocol}://${rootDomain}`}
            className="group inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-foreground hover:underline"
          >
            Create a site
            <ArrowLeft className="w-3.5 h-3.5 rotate-180 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sites.map((site, index) => (
        <SiteCard
          key={site.subdomain}
          site={site}
          action={action}
          isPending={isPending}
          index={index}
        />
      ))}
    </div>
  );
}

function Toast({ type, message, onClose }: { type: 'error' | 'success'; message: string; onClose?: () => void }) {
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

export function AdminDashboard({ sites }: { sites: Site[] }) {
  const [state, action, isPending] = useActionState<DeleteState, FormData>(
    deleteSubdomainAction,
    {}
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8 md:py-12">
        <DashboardHeader siteCount={sites.length} />
        <SiteGrid sites={sites} action={action} isPending={isPending} />

        {state.error && (
          <Toast type="error" message={state.error} />
        )}

        {state.success && (
          <Toast type="success" message={state.success} />
        )}
      </div>
    </div>
  );
}
