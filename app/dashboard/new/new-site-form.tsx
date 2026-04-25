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
  { value: 'auto', label: 'Auto', icon: Wand2, color: 'from-sky-400/40 to-blue-600/50', bgFrom: 'oklch(0.75 0.12 237 / 0.06)', bgTo: 'oklch(0.55 0.18 261 / 0.15)', accent: 'oklch(0.65 0.18 255 / 0.4)' },
  { value: 'dev', label: 'Developer', icon: TypeScript, color: 'from-blue-500/35 to-indigo-600/50', bgFrom: 'oklch(0.62 0.17 257 / 0.06)', bgTo: 'oklch(0.52 0.2 277 / 0.14)', accent: 'oklch(0.62 0.17 257 / 0.4)' },
  { value: 'designer', label: 'Designer', icon: Dribbble, color: 'from-rose-400/40 to-pink-500/50', bgFrom: 'oklch(0.72 0.15 15 / 0.06)', bgTo: 'oklch(0.65 0.22 350 / 0.14)', accent: 'oklch(0.7 0.18 5 / 0.4)' },
  { value: 'founder', label: 'Founder', icon: OpenClaw, color: 'from-orange-400/40 to-red-500/50', bgFrom: 'oklch(0.76 0.14 55 / 0.06)', bgTo: 'oklch(0.6 0.2 30 / 0.14)', accent: 'oklch(0.7 0.16 45 / 0.4)' },
  { value: 'creator', label: 'Creator', icon: Manus, color: 'from-violet-400/40 to-fuchsia-500/50', bgFrom: 'oklch(0.65 0.18 278 / 0.06)', bgTo: 'oklch(0.6 0.22 314 / 0.14)', accent: 'oklch(0.65 0.2 290 / 0.4)' },
  { value: 'minimal', label: 'Minimal', icon: Bento, color: 'from-stone-300/40 to-slate-400/50', bgFrom: 'oklch(0.9 0.01 90 / 0.08)', bgTo: 'oklch(0.75 0.02 260 / 0.12)', accent: 'oklch(0.8 0.02 270 / 0.4)' },
];

const aestheticStyles = [
  { value: 'auto', label: 'Auto', icon: Wand2, color: 'from-sky-400/40 to-blue-600/50', bgFrom: 'oklch(0.75 0.12 237 / 0.06)', bgTo: 'oklch(0.55 0.18 261 / 0.15)', accent: 'oklch(0.65 0.18 255 / 0.4)' },
  { value: 'editorial', label: 'Editorial', icon: Notion, color: 'from-amber-100/60 to-orange-200/70', bgFrom: 'oklch(0.95 0.03 85 / 0.1)', bgTo: 'oklch(0.88 0.06 75 / 0.18)', accent: 'oklch(0.7 0.1 65 / 0.35)' },
  { value: 'minimal', label: 'Minimal', icon: Linear, color: 'from-slate-300/50 to-gray-300/60', bgFrom: 'oklch(0.92 0.01 260 / 0.08)', bgTo: 'oklch(0.85 0.01 270 / 0.14)', accent: 'oklch(0.75 0.02 260 / 0.4)' },
  { value: 'brutalist', label: 'Brutalist', icon: Discord, color: 'from-neutral-700/50 to-stone-800/60', bgFrom: 'oklch(0.4 0.01 280 / 0.12)', bgTo: 'oklch(0.3 0.01 280 / 0.2)', accent: 'oklch(0.4 0.01 280 / 0.5)' },
  { value: 'organic', label: 'Organic', icon: Canva, color: 'from-emerald-400/40 to-teal-500/50', bgFrom: 'oklch(0.75 0.14 158 / 0.06)', bgTo: 'oklch(0.68 0.15 183 / 0.14)', accent: 'oklch(0.7 0.15 165 / 0.4)' },
  { value: 'maximalist', label: 'Maximalist', icon: Figma, color: 'from-purple-500/40 via-pink-500/40 to-yellow-400/50', bgFrom: 'oklch(0.6 0.2 280 / 0.06)', bgTo: 'oklch(0.85 0.15 95 / 0.14)', accent: 'oklch(0.65 0.2 330 / 0.4)' },
  { value: 'art-deco', label: 'Art Deco', icon: Hexagon, color: 'from-amber-400/40 to-yellow-500/50', bgFrom: 'oklch(0.78 0.12 80 / 0.06)', bgTo: 'oklch(0.72 0.14 95 / 0.14)', accent: 'oklch(0.75 0.12 85 / 0.4)' },
  { value: 'industrial', label: 'Industrial', icon: Docker, color: 'from-slate-500/40 to-zinc-600/50', bgFrom: 'oklch(0.6 0.02 260 / 0.06)', bgTo: 'oklch(0.5 0.03 280 / 0.14)', accent: 'oklch(0.6 0.03 270 / 0.4)' },
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

          {/* Template - Compact card grid */}
          <div className={cn("space-y-4 transition-all duration-700 ease-out", isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")} style={{ transitionDelay: '300ms' }}>
            <label className="text-sm font-medium text-foreground">
              Choose a template
            </label>
            <input type="hidden" name="template" value={template} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {templates.map((t) => {
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
                      "flex flex-col items-center gap-2 text-center",
                      isSelected && "shadow-lg ring-2 scale-105",
                      !isSelected && "border-border/40 hover:shadow-md hover:scale-102"
                    )}
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${t.bgFrom}, ${t.bgTo})`
                        : `linear-gradient(135deg, ${t.bgFrom.replace(/\/ 0\.[0-9]+\)/, ' / 0.02)')}, ${t.bgTo.replace(/\/ 0\.[0-9]+\)/, ' / 0.05)')})`,
                      borderColor: isSelected ? t.accent : undefined,
                      '--tw-ring-color': isSelected ? t.accent : undefined,
                    } as React.CSSProperties}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = t.accent; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = ''; }}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ease-out",
                        "bg-gradient-to-br",
                        t.color,
                        isSelected ? "scale-110 rotate-0" : "group-hover:scale-110 group-hover:rotate-3"
                      )}
                    >
                      {isLogo ? (
                        <Icon className="w-6 h-6" />
                      ) : (
                        <Icon className="w-5 h-5 text-foreground/80" />
                      )}
                    </div>
                    <span className={cn(
                      "text-xs font-medium",
                      isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                      {t.label}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center animate-pulse">
                        <Check className="w-2.5 h-2.5 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aesthetic - Compact card grid */}
          <div className={cn("space-y-4 transition-all duration-700 ease-out", isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")} style={{ transitionDelay: '400ms' }}>
            <label className="text-sm font-medium text-foreground">
              Choose visual style
            </label>
            <input type="hidden" name="aesthetic" value={aesthetic} />
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {aestheticStyles.map((s) => {
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
                      "flex flex-col items-center gap-2 text-center",
                      isSelected && "shadow-lg ring-2 scale-105",
                      !isSelected && "border-border/40 hover:shadow-md hover:scale-102"
                    )}
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${s.bgFrom}, ${s.bgTo})`
                        : `linear-gradient(135deg, ${s.bgFrom.replace(/\/ 0\.[0-9]+\)/, ' / 0.02)')}, ${s.bgTo.replace(/\/ 0\.[0-9]+\)/, ' / 0.05)')})`,
                      borderColor: isSelected ? s.accent : undefined,
                      '--tw-ring-color': isSelected ? s.accent : undefined,
                    } as React.CSSProperties}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = s.accent; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = ''; }}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ease-out",
                        "bg-gradient-to-br",
                        s.color,
                        isSelected ? "scale-110 rotate-0" : "group-hover:scale-110 group-hover:rotate-3"
                      )}
                    >
                      {isLogo ? (
                        <Icon className="w-6 h-6" />
                      ) : (
                        <Icon className="w-5 h-5 text-foreground/80" />
                      )}
                    </div>
                    <span className={cn(
                      "text-xs font-medium",
                      isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                      {s.label}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center animate-pulse">
                        <Check className="w-2.5 h-2.5 text-primary-foreground" />
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
