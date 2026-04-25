import Link from 'next/link';
import { rootDomain } from '@/lib/utils';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '@/components/sign-out-button';
import { InteractiveDemo } from '@/components/interactive-demo';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5 pointer-events-none" />
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-background" />
            </div>
            <span className="font-medium text-sm tracking-tight">{rootDomain}</span>
          </div>
          {isAuthenticated ? (
            <SignOutButton />
          ) : (
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary mb-8">
            <span className="font-medium">Prompt → Production</span>
          </div>

          {/* Heading */}
          <h1 className="text-[clamp(2.5rem,7vw,4rem)] font-semibold tracking-tight leading-[1.05] text-foreground mb-5">
            Describe it.
            <br />
            <span className="text-muted-foreground">We ship it.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg mx-auto">
            One prompt. Real website. Not a template.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link href="/auth/signin">
              <Button size="lg" className="h-11 px-6 group transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30">
                Generate My Site
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="h-11 px-6 transition-all duration-200 hover:bg-secondary/50">
                View Dashboard
              </Button>
            </Link>
          </div>

          {/* Product Demo */}
          <div className="mb-20 animate-fade-in delay-100">
            <InteractiveDemo />
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 text-left animate-fade-in delay-100">
            {[
              {
                title: 'From prompt → layout, copy, and components',
                description: 'Describe what you need. AI generates the entire site—design, content, and structure—instantly.'
              },
              {
                title: 'Instant deploy with shareable URL',
                description: 'Your site goes live immediately. Get a working link you can share anywhere, right now.'
              },
              {
                title: 'Edit anything—no lock-in, no weird builders',
                description: 'Full control over every element. No proprietary drag-and-drop nightmares.'
              }
            ].map((feature, i) => (
              <div 
                key={feature.title}
                className="p-5 rounded-xl bg-card border border-border/40 transition-all duration-200 hover:border-border hover:shadow-sm hover:bg-secondary/20"
              >
                <h3 className="font-medium text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Trust indicator */}
          <div className="mt-16 pt-8 border-t border-border/30 animate-fade-in delay-200">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">10,000+</span> sites built and counting
            </p>
          </div>
        </div>
      </main>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
