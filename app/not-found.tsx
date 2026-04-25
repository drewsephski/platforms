'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { rootDomain, protocol } from '@/lib/utils';
import { SearchX, ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFound() {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Extract subdomain from URL if we're on a subdomain page
    if (pathname?.startsWith('/s/')) {
      const extractedSubdomain = pathname.split('/')[2];
      if (extractedSubdomain) {
        setSubdomain(extractedSubdomain);
      }
    } else {
      // Try to extract from hostname for direct subdomain access
      const hostname = window.location.hostname;
      if (hostname.includes(`.${rootDomain.split(':')[0]}`)) {
        const extractedSubdomain = hostname.split('.')[0];
        setSubdomain(extractedSubdomain);
      }
    }
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5 pointer-events-none" />
      
      {/* Top navigation */}
      <nav className="relative z-10 w-full px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link 
            href={`${protocol}://${rootDomain}`}
            className="flex items-center gap-2 group"
          >
            <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center transition-all duration-200 group-hover:scale-105">
              <Sparkles className="w-4 h-4 text-background" />
            </div>
            <span className="font-medium text-sm tracking-tight">{rootDomain}</span>
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24 min-h-[calc(100vh-80px)]">
        <div className="text-center max-w-md mx-auto animate-fade-in">
          {/* Icon */}
          <div className="relative inline-block mb-8">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
              <SearchX className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-br from-muted/50 to-accent/5 rounded-3xl -z-10 blur-xl" />
          </div>
          
          {/* Heading */}
          <h1 className="text-[clamp(1.5rem,4vw,2rem)] font-semibold tracking-tight text-foreground mb-3">
            {subdomain ? (
              <>
                <span className="text-muted-foreground">{subdomain}</span>
                <span className="text-foreground">.{rootDomain}</span>
              </>
            ) : (
              'Page not found'
            )}
          </h1>
          
          {/* Description */}
          <p className="text-base text-muted-foreground leading-relaxed mb-8">
            {subdomain 
              ? `This subdomain hasn't been created yet. You can claim it now.`
              : `The page you're looking for doesn't exist or has been moved.`
            }
          </p>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`${protocol}://${rootDomain}`}
              className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-all duration-200"
            >
              {subdomain ? (
                <>
                  <span>Create {subdomain}</span>
                </>
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to {rootDomain}</span>
                </>
              )}
            </Link>
            
            {subdomain && (
              <Link
                href={`${protocol}://${rootDomain}`}
                className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-foreground bg-card border border-border/60 rounded-lg hover:bg-secondary/50 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span>Go home</span>
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-1 text-xs text-muted-foreground/70">
          <span>Error 404</span>
        </div>
      </footer>
    </div>
  );
}
