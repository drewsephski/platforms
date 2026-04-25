'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateSiteAction } from '@/app/actions/generate-site';
import { Loader2, ArrowLeft, AlertCircle, Wand2, Code2, Palette, Rocket, User, Minimize2, BookOpen, Hexagon, Factory } from 'lucide-react';
import { rootDomain } from '@/lib/utils';
import { cn } from '@/lib/utils';

type State = {
  error?: string;
  success?: boolean;
};

const templates = [
  { value: 'auto', label: 'Auto', desc: 'AI picks', icon: Wand2 },
  { value: 'dev', label: 'Developer', desc: 'Code-focused', icon: Code2 },
  { value: 'designer', label: 'Designer', desc: 'Visual-first', icon: Palette },
  { value: 'founder', label: 'Founder', desc: 'Startup ready', icon: Rocket },
  { value: 'creator', label: 'Creator', desc: 'Social ready', icon: User },
  { value: 'minimal', label: 'Minimal', desc: 'Clean & focused', icon: Minimize2 },
];

const aestheticStyles = [
  { value: 'auto', label: 'Auto', desc: 'Smart pick', icon: Wand2 },
  { value: 'editorial', label: 'Editorial', desc: 'Magazine style', icon: BookOpen },
  { value: 'minimal', label: 'Minimal', desc: 'Essential only', icon: Minimize2 },
  { value: 'brutalist', label: 'Brutalist', desc: 'Raw & bold', icon: Hexagon },
  { value: 'organic', label: 'Organic', desc: 'Natural flow', icon: Palette },
  { value: 'maximalist', label: 'Maximalist', desc: 'Go all out', icon: Rocket },
  { value: 'art-deco', label: 'Art Deco', desc: 'Geometric glam', icon: Hexagon },
  { value: 'industrial', label: 'Industrial', desc: 'Functional', icon: Factory },
];

export function NewSiteForm({ userId }: { userId: string }) {
  const [state, action, isPending] = useActionState<State, FormData>(
    generateSiteAction,
    {}
  );
  const [template, setTemplate] = useState('auto');
  const [aesthetic, setAesthetic] = useState('auto');
  const [prompt, setPrompt] = useState('');

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
      <nav className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-medium">{rootDomain}</span>
          <a 
            href="/dashboard" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </a>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight mb-2">
            Create your site
          </h1>
          <p className="text-muted-foreground">
            Describe your business, audience, and vibe. AI will generate specific, compelling content and a distinctive design.
          </p>
        </div>

        <form action={action} className="space-y-10">
          {/* Subdomain */}
          <div className="space-y-2">
            <Label htmlFor="subdomain">Subdomain</Label>
            <div className="flex items-center max-w-sm">
              <Input
                id="subdomain"
                name="subdomain"
                placeholder="my-portfolio"
                className="rounded-r-none border-r-0"
                required
                autoComplete="off"
                spellCheck={false}
              />
              <span className="px-3 py-2 border border-l-0 border-input rounded-r-md bg-muted text-muted-foreground text-sm">
                .{rootDomain}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Letters, numbers, and hyphens only. 3-32 characters.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Describe your site</Label>
            <Textarea
              id="prompt"
              name="prompt"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                analyzePrompt(e.target.value);
              }}
              placeholder="A portfolio for a senior TypeScript developer specializing in design systems and performance optimization. Formerly at Vercel, now consulting for startups. Loves open source, clean UI, and mentoring. Projects should show measurable impact like 'reduced bundle size by 40%'."
              className="min-h-[120px] resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">
              Be specific: your role, target audience, key differentiators, and desired vibe. The more detail, the better the result.
            </p>
          </div>

          {/* Template */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <Label>Choose a template</Label>
              <span className="text-xs text-muted-foreground">{templates.find(t => t.value === template)?.desc}</span>
            </div>
            <input type="hidden" name="template" value={template} />
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {templates.map((t) => {
                const Icon = t.icon;
                const isSelected = template === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTemplate(t.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border text-center transition-colors",
                      isSelected
                        ? "border-foreground bg-foreground/5"
                        : "border-border hover:border-foreground/30"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isSelected ? "text-foreground" : "text-muted-foreground")} />
                    <span className={cn("text-xs", isSelected ? "font-medium" : "text-muted-foreground")}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aesthetic */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <Label>Choose visual style</Label>
              <span className="text-xs text-muted-foreground">
                {aesthetic === 'auto' ? 'Smart pick based on your description' : aestheticStyles.find(s => s.value === aesthetic)?.desc}
              </span>
            </div>
            <input type="hidden" name="aesthetic" value={aesthetic} />
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {aestheticStyles.map((s) => {
                const Icon = s.icon;
                const isSelected = aesthetic === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setAesthetic(s.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border text-center transition-colors",
                      isSelected
                        ? "border-foreground bg-foreground/5"
                        : "border-border hover:border-foreground/30"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isSelected ? "text-foreground" : "text-muted-foreground")} />
                    <span className={cn("text-xs", isSelected ? "font-medium" : "text-muted-foreground")}>
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {state?.error && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{state.error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating site...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Site
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-3">
              AI generates specific content, responsive layouts, and distinctive design in 10-30 seconds
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
