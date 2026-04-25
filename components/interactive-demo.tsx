'use client';

import { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { generateDemoSite } from '@/app/actions/demo-generate';
import type { SiteContent } from '@/lib/types/site';
import { SiteRenderer } from '@/components/site-renderer';

export function InteractiveDemo() {
  const [step, setStep] = useState<'idle' | 'prompt-input' | 'typing' | 'generating' | 'complete'>('idle');
  const [displayPrompt, setDisplayPrompt] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<SiteContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpenPrompt = () => {
    setStep('prompt-input');
  };

  const handlePromptSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userPrompt.trim()) return;
    
    setStep('typing');
    setError(null);
    
    // Typing animation
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < userPrompt.length) {
        setDisplayPrompt(userPrompt.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
        setStep('generating');
        
        // Call AI to generate real content
        generateDemoSite(userPrompt).then(result => {
          if (result.success && result.content) {
            setGeneratedContent(result.content);
            setStep('complete');
          } else {
            setError(result.error || 'Failed to generate site');
            setStep('idle');
          }
        }).catch(err => {
          setError('An error occurred while generating');
          setStep('idle');
        });
      }
    }, 25);
  };

  const handleReset = () => {
    setStep('idle');
    setDisplayPrompt('');
    setUserPrompt('');
    setGeneratedContent(null);
    setError(null);
  };

  const handleClosePrompt = () => {
    setStep('idle');
  };

  const handlePrebuiltPrompt = (prompt: string) => {
    setUserPrompt(prompt);
    setStep('prompt-input');
  };

  return (
    <div className="relative mx-auto max-w-2xl">
      {/* Prompt input mock */}
      <div className="bg-card border border-border/50 rounded-t-xl p-5 border-b-0 transition-all duration-500 ease-out-quart">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 font-medium tracking-wide uppercase">
          <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${step === 'idle' ? 'bg-foreground/20' : 'bg-primary'}`}></span>
          <span>Your prompt</span>
        </div>
        <div className="min-h-[2.75rem] flex items-center">
          {step === 'idle' ? (
            <button
              onClick={handleOpenPrompt}
              className="text-foreground font-medium hover:text-primary transition-colors duration-300 ease-out flex items-center gap-2 group"
            >
              <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Click to generate a site
              </span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
            </button>
          ) : step === 'prompt-input' ? (
            <form onSubmit={handlePromptSubmit} className="w-full flex items-center gap-2">
              <input
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Describe your site... e.g., Portfolio for a frontend developer"
                className="flex-1 bg-background border border-border/50 rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                autoFocus
              />
              <button
                type="button"
                onClick={handleClosePrompt}
                className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
              <button
                type="submit"
                disabled={!userPrompt.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <p className="text-foreground font-medium text-[15px] leading-relaxed">
              {displayPrompt}
              {step === 'typing' && <span className="inline-block w-0.5 h-4.5 bg-primary ml-1 animate-pulse" />}
            </p>
          )}
        </div>
      </div>
      
      {/* Prebuilt prompts */}
      {step === 'prompt-input' && (
        <div className="bg-primary/5 py-3 px-5 border-t border-border/30 transition-all duration-300 ease-out">
          <div className="flex flex-wrap gap-2">
            {[
              'Portfolio for a frontend developer',
              'Landing page for a design agency',
              'Photographer portfolio',
              'SaaS product with pricing',
              'Restaurant website with menu',
              'Personal blog with dark theme'
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => setUserPrompt(prompt)}
                className="text-xs px-3 py-1.5 bg-background border border-border/50 rounded-full text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-200"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Generated site preview */}
      <div className="bg-card border border-border/50 rounded-b-xl p-5 transition-all duration-500 ease-out-quart">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 font-medium tracking-wide uppercase">
          {step === 'complete' ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              <span className="text-green-600 dark:text-green-400">Generated in 3 seconds</span>
            </>
          ) : step === 'generating' ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-foreground/20"></span>
              <span>Waiting for prompt</span>
            </>
          )}
        </div>
        
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        
        {step === 'generating' && (
          <div className="bg-background rounded-lg border border-border/30 overflow-hidden transition-all duration-700 ease-out-quart">
            {/* Loading skeleton */}
            <div className="bg-foreground/[0.03] border-b border-border/20 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded bg-primary/25 animate-pulse"></div>
                <div className="h-2 w-20 bg-foreground/12 rounded animate-pulse"></div>
              </div>
              <div className="flex gap-3">
                <div className="h-2 w-14 bg-foreground/8 rounded animate-pulse"></div>
                <div className="h-2 w-14 bg-foreground/8 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="p-7 space-y-5">
              <div className="space-y-2.5">
                <div className="h-4.5 w-3/4 bg-foreground/18 rounded animate-pulse"></div>
                <div className="h-3 w-full bg-foreground/8 rounded animate-pulse"></div>
                <div className="h-3 w-4/5 bg-foreground/8 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
        
        {generatedContent && step === 'complete' && (
          <div className="bg-background rounded-lg border border-border/30 overflow-hidden transition-all duration-700 ease-out-quart">
            <div className="transform scale-[0.35] origin-top-left w-[285%] h-[285%] overflow-hidden">
              <SiteRenderer content={generatedContent} />
            </div>
          </div>
        )}

        {/* Reset button */}
        {step === 'complete' && (
          <div className="mt-5 text-center">
            <button
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-300 ease-out flex items-center gap-2 mx-auto font-medium tracking-wide uppercase"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Try another prompt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
