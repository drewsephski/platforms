'use client';

import { useActionState, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateSiteAction } from '@/app/actions/generate-site';
import { Loader2, Sparkles, ArrowLeft, AlertCircle, Rocket, User, Minimize2, Layout, Box, Leaf, Layers, Hexagon, Factory, Check, Wand2 } from 'lucide-react';
import { OpenClaw } from '@/logos/openclaw';
import { TypeScript } from '@/logos/typescript';
import { Dribbble } from '@/logos/dribble';
import { Bento } from '@/logos/bento';
import { Manus } from '@/logos/manus';
import { Notion } from '@/logos/notion';
import { Linear } from '@/logos/linear';
import { Discord } from '@/logos/discord';
import { Canva } from '@/logos/canva';
import { Figma } from '@/logos/figma';
import { Docker } from '@/logos/docker';
import { rootDomain } from '@/lib/utils';
import { cn } from '@/lib/utils';

type State = {
  error?: string;
  success?: boolean;
};

const templates = [
  { value: 'auto', label: 'Auto', desc: 'AI picks', icon: Wand2, gradient: 'radial-gradient(circle at 30% 30%, oklch(0.75 0.15 237 / 0.4), oklch(0.55 0.2 261 / 0.2))', border: 'oklch(0.65 0.18 255 / 0.5)', glow: 'oklch(0.65 0.18 255 / 0.3)' },
  { value: 'dev', label: 'Developer', desc: 'Code-focused', icon: TypeScript, gradient: 'radial-gradient(circle at 30% 30%, oklch(0.6 0.15 257 / 0.5), oklch(0.45 0.18 277 / 0.25))', border: 'oklch(0.55 0.2 270 / 0.6)', glow: 'oklch(0.6 0.15 260 / 0.35)' },
  { value: 'designer', label: 'Designer', desc: 'Visual-first', icon: Dribbble, gradient: 'radial-gradient(circle at 30% 30%, oklch(0.7 0.18 15 / 0.5), oklch(0.55 0.2 350 / 0.25))', border: 'oklch(0.65 0.2 10 / 0.6)', glow: 'oklch(0.7 0.18 5 / 0.35)' },
  { value: 'founder', label: 'Founder', desc: 'Startup ready', icon: OpenClaw, gradient: 'radial-gradient(circle at 30% 30%, oklch(0.72 0.16 55 / 0.5), oklch(0.5 0.18 30 / 0.25))', border: 'oklch(0.6 0.18 45 / 0.6)', glow: 'oklch(0.7 0.16 50 / 0.35)' },
  { value: 'creator', label: 'Creator', desc: 'Social ready', icon: Manus, gradient: 'radial-gradient(circle at 30% 30%, oklch(0.62 0.2 278 / 0.5), oklch(0.5 0.22 314 / 0.25))', border: 'oklch(0.55 0.2 290 / 0.6)', glow: 'oklch(0.6 0.2 285 / 0.35)' },
  { value: 'minimal', label: 'Minimal', desc: 'Clean & focused', icon: Bento, gradient: 'radial-gradient(circle at 30% 30%, oklch(0.85 0.03 90 / 0.4), oklch(0.7 0.04 260 / 0.2))', border: 'oklch(0.75 0.03 270 / 0.5)', glow: 'oklch(0.8 0.02 270 / 0.25)' },
];

const aestheticStyles = [
  { value: 'auto', label: 'Auto', desc: 'Smart pick', icon: Wand2, gradient: 'radial-gradient(circle at 30% 30%, oklch(0.75 0.15 237 / 0.4), oklch(0.55 0.2 261 / 0.2))', border: 'oklch(0.65 0.18 255 / 0.5)', glow: 'oklch(0.65 0.18 255 / 0.3)' },
  { value: 'editorial', label: 'Editorial', desc: 'Magazine style', icon: Notion, gradient: 'radial-gradient(circle at 30% 30%, oklch(0.93 0.05 85 / 0.5), oklch(0.82 0.08 75 / 0.25))', border: 'oklch(0.85 0.08 80 / 0.5)', glow: 'oklch(0.88 0.06 78 / 0.3)' },
  { value: 'minimal', label: 'Minimal', desc: 'Essential only', icon: Linear, gradient: 'radial-gradient(circle at 30% 30%, oklch(0.88 0.02 260 / 0.5), oklch(0.75 0.03 270 / 0.25))', border: 'oklch(0.8 0.03 265 / 0.5)', glow: 'oklch(0.82 0.02 268 / 0.3)' },
  { value: 'brutalist', label: 'Brutalist', desc: 'Raw & bold', icon: Discord, gradient: 'radial-gradient(circle at 30% 30%, oklch(0.45 0.02 280 / 0.6), oklch(0.3 0.02 280 / 0.3))', border: 'oklch(0.4 0.01 280 / 0.7)', glow: 'oklch(0.35 0.02 280 / 0.4)', isDark: true },
  { value: 'organic', label: 'Organic', desc: 'Natural flow', icon: Canva, gradient: 'radial-gradient(circle at 30% 30%, oklch(0.72 0.16 158 / 0.5), oklch(0.6 0.17 183 / 0.25))', border: 'oklch(0.65 0.16 165 / 0.6)', glow: 'oklch(0.68 0.15 168 / 0.35)' },
  { value: 'maximalist', label: 'Maximalist', desc: 'Go all out', icon: Figma, gradient: 'conic-gradient(from 45deg at 30% 30%, oklch(0.6 0.2 280 / 0.4), oklch(0.65 0.18 330 / 0.4), oklch(0.75 0.15 95 / 0.4), oklch(0.6 0.2 280 / 0.4))', border: 'oklch(0.6 0.18 300 / 0.6)', glow: 'oklch(0.65 0.2 290 / 0.35)' },
  { value: 'art-deco', label: 'Art Deco', desc: 'Geometric glam', icon: Hexagon, gradient: 'radial-gradient(circle at 30% 30%, oklch(0.75 0.14 80 / 0.5), oklch(0.65 0.16 95 / 0.25))', border: 'oklch(0.7 0.14 88 / 0.6)', glow: 'oklch(0.72 0.12 85 / 0.35)' },
  { value: 'industrial', label: 'Industrial', desc: 'Functional', icon: Docker, gradient: 'radial-gradient(circle at 30% 30%, oklch(0.55 0.03 260 / 0.5), oklch(0.4 0.04 280 / 0.25))', border: 'oklch(0.5 0.03 270 / 0.6)', glow: 'oklch(0.45 0.03 275 / 0.35)' },
];

export function NewSiteForm({ userId }: { userId: string }) {
  const [state, action, isPending] = useActionState<State, FormData>(
    generateSiteAction,
    {}
  );
  const [template, setTemplate] = useState('auto');
  const [aesthetic, setAesthetic] = useState('auto');
  const [prompt, setPrompt] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-select based on prompt keywords
  const analyzePrompt = (text: string) => {
    const lower = text.toLowerCase();
    
    // Template detection
    if (lower.includes('developer') || lower.includes('code') || lower.includes('github') || lower.includes('programming') || lower.includes('software')) {
      setTemplate('dev');
    } else if (lower.includes('design') || lower.includes('creative') || lower.includes('art') || lower.includes('visual')) {
      setTemplate('designer');
    } else if (lower.includes('startup') || lower.includes('product') || lower.includes('pitch') || lower.includes('launch')) {
      setTemplate('founder');
    } else if (lower.includes('creator') || lower.includes('influencer') || lower.includes('social') || lower.includes('link in bio')) {
      setTemplate('creator');
    } else if (lower.includes('minimal') || lower.includes('simple') || lower.includes('clean')) {
      setTemplate('minimal');
    }
    
    // Aesthetic detection
    if (lower.includes('magazine') || lower.includes('editorial') || lower.includes('sophisticated') || lower.includes('typography')) {
      setAesthetic('editorial');
    } else if (lower.includes('minimal') || lower.includes('clean') || lower.includes('simple') || lower.includes('restraint')) {
      setAesthetic('minimal');
    } else if (lower.includes('brutal') || lower.includes('raw') || lower.includes('bold') || lower.includes('stark')) {
      setAesthetic('brutalist');
    } else if (lower.includes('organic') || lower.includes('natural') || lower.includes('soft') || lower.includes('earthy')) {
      setAesthetic('organic');
    } else if (lower.includes('maximal') || lower.includes('vibrant') || lower.includes('energetic') || lower.includes('layered')) {
      setAesthetic('maximalist');
    } else if (lower.includes('art deco') || lower.includes('geometric') || lower.includes('metallic') || lower.includes('symmetrical')) {
      setAesthetic('art-deco');
    } else if (lower.includes('industrial') || lower.includes('grid') || lower.includes('functional') || lower.includes('monospace')) {
      setAesthetic('industrial');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-background" />
            </div>
            <span className="font-medium text-sm tracking-tight">{rootDomain}</span>
          </div>
          <a 
            href="/dashboard" 
            className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back</span>
          </a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header - Asymmetric layout */}
        <div className={cn("mb-12 transition-all duration-700 ease-out", isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-3">
                Create your site
              </h1>
              <p className="text-base text-muted-foreground max-w-md">
                Describe what you want to build. AI will generate the design, content, and structure.
              </p>
            </div>
            <div className={cn("hidden sm:flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 transition-all duration-500 ease-out", isMounted ? "opacity-100 scale-100" : "opacity-0 scale-90")}>
              <Rocket className={cn("w-8 h-8 text-primary transition-transform duration-700 ease-out", isMounted && "hover:scale-110 hover:rotate-12")} />
            </div>
          </div>
        </div>

        <form action={action} className="space-y-10">
          {/* Subdomain - Left aligned with label */}
          <div className={cn("space-y-3 transition-all duration-700 ease-out", isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")} style={{ transitionDelay: '100ms' }}>
            <label htmlFor="subdomain" className="text-sm font-medium text-foreground">
              Subdomain
            </label>
            <div className="flex items-center max-w-md group">
              <Input
                id="subdomain"
                name="subdomain"
                placeholder="my-portfolio"
                className="w-full rounded-r-none border-r-0 bg-background focus-visible:ring-2 focus-visible:ring-ring transition-all duration-300 ease-out group-hover:border-primary/50"
                required
                autoComplete="off"
                spellCheck={false}
              />
              <span className="px-4 py-2.5 border border-l-0 border-input rounded-r-md bg-muted/50 text-muted-foreground text-sm font-medium transition-all duration-300 ease-out group-hover:bg-muted/70">
                .{rootDomain}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Letters, numbers, and hyphens only. 3-32 characters.
            </p>
          </div>

          {/* Description - Full width */}
          <div className={cn("space-y-3 transition-all duration-700 ease-out", isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")} style={{ transitionDelay: '200ms' }}>
            <label htmlFor="prompt" className="text-sm font-medium text-foreground">
              Describe your site
            </label>
            <Textarea
              id="prompt"
              name="prompt"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                analyzePrompt(e.target.value);
              }}
              placeholder="A portfolio for a senior TypeScript developer who loves open source and clean UI. Include sections for projects, about me, and contact info."
              className="min-h-[120px] resize-none bg-background focus-visible:ring-2 focus-visible:ring-ring transition-all duration-300 ease-out hover:border-primary/50"
              required
            />
            <p className="text-xs text-muted-foreground">
              Describe your vibe, audience, and what sections you want.
            </p>
          </div>

          {/* Template - Enhanced card grid */}
          <div className={cn("space-y-4 transition-all duration-700 ease-out", isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")} style={{ transitionDelay: '300ms' }}>
            <div className="flex items-baseline justify-between">
              <label className="text-sm font-medium text-foreground">
                Choose a template
              </label>
              <span className="text-xs text-muted-foreground">{templates.find(t => t.value === template)?.desc}</span>
            </div>
            <input type="hidden" name="template" value={template} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {templates.map((t, index) => {
                const Icon = t.icon;
                const isSelected = template === t.value;
                const isLogo = t.value === 'dev' || t.value === 'designer' || t.value === 'founder' || t.value === 'creator' || t.value === 'minimal';
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTemplate(t.value)}
                    className={cn(
                      "relative group p-4 rounded-xl border transition-all duration-300 ease-out",
                      "flex flex-col items-center gap-2.5 text-center",
                      isSelected && "shadow-lg ring-2 ring-offset-1",
                      !isSelected && "border-border/40 hover:shadow-md hover:border-border/60"
                    )}
                    style={{
                      background: isSelected ? t.gradient : `linear-gradient(135deg, oklch(0.97 0.01 260 / 0.5), oklch(0.95 0.01 270 / 0.6))`,
                      borderColor: isSelected ? t.border : undefined,
                      '--tw-ring-color': isSelected ? t.border : undefined,
                      boxShadow: isSelected ? `0 4px 20px -4px ${t.glow}` : undefined,
                      transitionDelay: `${index * 50}ms`,
                    } as React.CSSProperties}
                  >
                    {/* Glow effect background */}
                    <div
                      className={cn(
                        "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300",
                        isSelected && "opacity-100"
                      )}
                      style={{
                        background: t.gradient,
                        filter: 'blur(20px)',
                        transform: 'scale(0.9)',
                        zIndex: -1,
                      }}
                    />

                    <div
                      className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ease-out relative overflow-hidden",
                        isSelected ? "scale-105" : "group-hover:scale-105"
                      )}
                      style={{
                        background: t.gradient,
                        boxShadow: isSelected ? `0 2px 12px -2px ${t.glow}` : 'none',
                      }}
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {isLogo ? (
                        <Icon className="w-6 h-6 relative z-10" />
                      ) : (
                        <Icon className="w-5 h-5 text-foreground/80 relative z-10" />
                      )}
                    </div>

                    <span className={cn(
                      "text-xs font-medium",
                      isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                      {t.label}
                    </span>

                    {isSelected && (
                      <div
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: t.border }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aesthetic - Enhanced card grid */}
          <div className={cn("space-y-4 transition-all duration-700 ease-out", isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")} style={{ transitionDelay: '400ms' }}>
            <div className="flex items-baseline justify-between">
              <label className="text-sm font-medium text-foreground">
                Choose visual style
              </label>
              <span className="text-xs text-muted-foreground">{aestheticStyles.find(s => s.value === aesthetic)?.desc}</span>
            </div>
            <input type="hidden" name="aesthetic" value={aesthetic} />
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {aestheticStyles.map((s, index) => {
                const Icon = s.icon;
                const isSelected = aesthetic === s.value;
                const isLogo = s.value === 'editorial' || s.value === 'minimal' || s.value === 'brutalist' || s.value === 'organic' || s.value === 'maximalist' || s.value === 'industrial';
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setAesthetic(s.value)}
                    className={cn(
                      "relative group p-4 rounded-xl border transition-all duration-300 ease-out",
                      "flex flex-col items-center gap-2.5 text-center",
                      isSelected && "shadow-lg ring-2 ring-offset-1",
                      !isSelected && "border-border/40 hover:shadow-md hover:border-border/60"
                    )}
                    style={{
                      background: isSelected ? s.gradient : (s.isDark ? 'linear-gradient(135deg, oklch(0.25 0.01 280 / 0.8), oklch(0.2 0.01 280 / 0.9))' : `linear-gradient(135deg, oklch(0.97 0.01 260 / 0.5), oklch(0.95 0.01 270 / 0.6))`),
                      borderColor: isSelected ? s.border : undefined,
                      '--tw-ring-color': isSelected ? s.border : undefined,
                      boxShadow: isSelected ? `0 4px 20px -4px ${s.glow}` : undefined,
                      transitionDelay: `${index * 50}ms`,
                    } as React.CSSProperties}
                  >
                    {/* Glow effect background */}
                    <div
                      className={cn(
                        "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300",
                        isSelected && "opacity-100"
                      )}
                      style={{
                        background: s.gradient,
                        filter: 'blur(20px)',
                        transform: 'scale(0.9)',
                        zIndex: -1,
                      }}
                    />

                    <div
                      className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ease-out relative overflow-hidden",
                        isSelected ? "scale-105" : "group-hover:scale-105"
                      )}
                      style={{
                        background: s.gradient,
                        boxShadow: isSelected ? `0 2px 12px -2px ${s.glow}` : 'none',
                      }}
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {isLogo ? (
                        <Icon className={cn("w-6 h-6 relative z-10", s.isDark && "text-white")} />
                      ) : (
                        <Icon className={cn("w-5 h-5 relative z-10", s.isDark ? "text-white/90" : "text-foreground/80")} />
                      )}
                    </div>

                    <span className={cn(
                      "text-xs font-medium",
                      isSelected ? (s.isDark ? "text-white" : "text-foreground") : (s.isDark ? "text-white/70 group-hover:text-white" : "text-muted-foreground group-hover:text-foreground")
                    )}>
                      {s.label}
                    </span>

                    {isSelected && (
                      <div
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: s.border }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {state?.error && (
            <div className={cn("flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 transition-all duration-500 ease-out", isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")} style={{ transitionDelay: '500ms' }}>
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0 animate-pulse" />
              <p className="text-sm text-destructive">{state.error}</p>
            </div>
          )}

          {/* Submit - Full width */}
          <div className={cn("pt-4 transition-all duration-700 ease-out", isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")} style={{ transitionDelay: '600ms' }}>
            <Button
              type="submit"
              className="w-full h-12 text-sm font-medium group relative overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              disabled={isPending}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating site...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2 transition-transform duration-300 ease-out group-hover:scale-125 group-hover:rotate-12" />
                  Generate Site with AI
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground/60 mt-4">
              AI generation may take 10-30 seconds
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
