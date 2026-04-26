'use client';

import type { SiteContent, Section, Theme, ProjectItem } from '@/lib/types/site';
import { defaultContent } from '@/lib/types/site';
import { useEffect, useState, useRef, useMemo } from 'react';

// Enhanced animation helper with intersection observer for scroll-triggered reveals
function useStaggeredReveal(itemCount: number, baseDelay = 100) {
  const [visible, setVisible] = useState<boolean[]>(new Array(itemCount).fill(false));
  const [hasTriggered, setHasTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered) {
          setHasTriggered(true);
          const timers = visible.map((_, i) =>
            setTimeout(() => {
              setVisible(prev => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, i * baseDelay)
          );
          return () => timers.forEach(t => clearTimeout(t));
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [itemCount, baseDelay, hasTriggered]);

  return visible;
}

// Hook for single element reveal
function useReveal() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { isVisible, ref };
}

// Enhanced decorative elements with more variety
function DecorativeElements({ type, colors }: { type: string; colors?: Theme['colors'] }) {
  const accent = colors?.accent || '#000';
  const primary = colors?.primary || '#000';
  const muted = colors?.muted || '#666';

  if (type === 'shapes') {
    return (
      <>
        <div className="absolute top-20 right-10 w-32 h-32 rounded-full opacity-20 blur-xl"
          style={{ background: accent }} />
        <div className="absolute bottom-40 left-20 w-24 h-24 rotate-45 opacity-10"
          style={{ background: primary }} />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full opacity-10"
          style={{ background: muted }} />
      </>
    );
  }
  if (type === 'lines') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.08]">
        <line x1="10%" y1="0" x2="10%" y2="100%" stroke="currentColor" strokeWidth="1" />
        <line x1="90%" y1="0" x2="90%" y2="100%" stroke="currentColor" strokeWidth="1" />
        <line x1="0" y1="33%" x2="100%" y2="33%" stroke="currentColor" strokeWidth="0.5" />
        <line x1="0" y1="66%" x2="100%" y2="66%" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    );
  }
  if (type === 'gradient') {
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 70% 30%, ${accent}15 0%, transparent 50%),
                       radial-gradient(ellipse at 30% 70%, ${primary}10 0%, transparent 40%)`,
        }}
      />
    );
  }
  if (type === 'grain') {
    return (
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    );
  }
  if (type === 'mesh') {
    return (
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(${accent}10 1px, transparent 1px),
            linear-gradient(90deg, ${accent}10 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    );
  }
  if (type === 'aurora') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-1/2 -left-1/2 w-full h-full opacity-20 blur-3xl"
          style={{ background: `conic-gradient(from 0deg at 50% 50%, ${accent}00 0deg, ${accent}30 60deg, ${primary}20 120deg, ${accent}00 180deg)` }}
        />
      </div>
    );
  }
  if (type === 'texture') {
    return (
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${accent} 0px, ${accent} 1px, transparent 1px, transparent 11px),
                            repeating-linear-gradient(-45deg, ${accent} 0px, ${accent} 1px, transparent 1px, transparent 11px)`,
        }}
      />
    );
  }
  return null;
}

// Background effects for hero sections
function BackgroundEffect({ type, colors }: { type: string; colors?: Theme['colors'] }) {
  const accent = colors?.accent || '#000';
  const background = colors?.background || '#fff';
  const primary = colors?.primary || '#000';

  if (type === 'mesh') {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, ${accent}15 0%, transparent 40%),
                              radial-gradient(circle at 80% 70%, ${primary}10 0%, transparent 40%),
                              radial-gradient(circle at 50% 50%, ${accent}08 0%, transparent 50%)`,
          }}
        />
      </div>
    );
  }
  if (type === 'aurora') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/4 w-1/2 h-full opacity-20 blur-[100px]"
          style={{ background: `linear-gradient(180deg, ${accent}30 0%, transparent 70%)` }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-1/2 h-full opacity-15 blur-[100px]"
          style={{ background: `linear-gradient(0deg, ${primary}30 0%, transparent 70%)` }}
        />
      </div>
    );
  }
  if (type === 'noise') {
    return (
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    );
  }
  if (type === 'dots') {
    return (
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, ${accent} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
    );
  }
  return null;
}

// Fluid type scale using clamp for responsive typography
const fluidType = {
  hero: 'clamp(2rem, 5vw + 1rem, 4rem)',
  headline: 'clamp(1.5rem, 3vw + 0.5rem, 2.5rem)',
  subheadline: 'clamp(1rem, 1.5vw + 0.5rem, 1.25rem)',
  body: 'clamp(0.875rem, 0.5vw + 0.5rem, 1rem)',
  small: 'clamp(0.75rem, 0.3vw + 0.5rem, 0.875rem)',
};

// Easing functions - more organic motion
const easeOutQuart = 'cubic-bezier(0.25, 1, 0.5, 1)';
const easeOutExpo = 'cubic-bezier(0.16, 1, 0.3, 1)';
const easeInOutQuart = 'cubic-bezier(0.76, 0, 0.24, 1)';

// Content helpers - always return valid content with fallbacks
const getContent = (provided: string | undefined | null, fallback: string) => provided?.trim() || fallback;

const getProjectItems = (items: ProjectItem[] | undefined): ProjectItem[] => {
  if (!items || items.length === 0) {
    return defaultContent.projects.items;
  }
  return items.map((item, i) => ({
    id: item.id || `project-${i}`,
    title: item.title || 'Project',
    description: item.description || 'A showcase of craft and attention to detail.',
    href: item.href || '#',
    tags: item.tags || [],
    imageUrl: item.imageUrl,
    accentColor: item.accentColor,
    size: item.size || 'medium',
    category: item.category,
    year: item.year,
  }));
};

type TestimonialItem = {
  id: string;
  quote: string;
  name: string;
  role?: string;
  company?: string;
  outcome?: string;
  avatarUrl?: string;
  rating?: number;
};

const getTestimonialItems = (items: TestimonialItem[] | undefined): TestimonialItem[] => {
  if (!items || items.length === 0) {
    return defaultContent.testimonials.items as TestimonialItem[];
  }
  return items.map((item, i) => ({
    id: item.id || `testimonial-${i}`,
    quote: item.quote || 'Exceptional work that exceeded expectations.',
    name: item.name || 'Client',
    role: item.role,
    company: item.company,
    outcome: item.outcome,
    avatarUrl: item.avatarUrl,
    rating: item.rating,
  }));
};

// Button variants
function Button({
  href,
  children,
  variant = 'primary',
  colors,
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  colors?: Theme['colors'];
}) {
  const baseStyles = "inline-flex items-center font-medium transition-all duration-300";

  const variants = {
    primary: `px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base tracking-wide hover:scale-[1.02] active:scale-[0.98]`,
    secondary: `px-5 sm:px-6 py-2.5 sm:py-3 border-2 text-sm hover:bg-opacity-10 hover:bg-black`,
    ghost: `px-5 sm:px-6 py-2.5 sm:py-3 text-sm hover:opacity-70`,
  };

  const getStyles = () => {
    if (variant === 'primary') {
      return {
        backgroundColor: colors?.accent || '#000',
        color: '#fff',
      };
    }
    if (variant === 'secondary') {
      return {
        borderColor: colors?.accent || '#000',
        color: colors?.text || '#000',
      };
    }
    return { color: colors?.text || '#000' };
  };

  return (
    <a
      href={href}
      className={`${baseStyles} ${variants[variant]}`}
      style={getStyles()}
    >
      {children}
    </a>
  );
}

function HeroSection({
  section,
  theme,
}: {
  section: Extract<Section, { type: 'hero' }>;
  theme: Theme;
}) {
  const layout = section.layout || { textAlign: 'center', verticalAlign: 'center', decorative: 'gradient' };
  const textAlign = layout.textAlign || 'center';
  const verticalAlign = layout.verticalAlign || 'center';
  const visible = useStaggeredReveal(4, 150);

  // Ensure all content has fallbacks
  const headline = getContent(section.headline, defaultContent.hero.headline);
  const subheadline = getContent(section.subheadline, defaultContent.hero.subheadline);
  const tagline = getContent(section.tagline, defaultContent.hero.tagline);
  const ctaText = getContent(section.cta?.text, defaultContent.hero.cta.text);
  const ctaHref = getContent(section.cta?.href, defaultContent.hero.cta.href);
  const secondaryCtaText = section.secondaryCta?.text;
  const secondaryCtaHref = section.secondaryCta?.href;

  const alignClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  };

  const verticalClasses = {
    top: 'justify-start pt-32',
    center: 'justify-center',
    bottom: 'justify-end pb-32',
  };

  // Asymmetric layout - enhanced with fluid typography and better responsive behavior
  if (section.style === 'asymmetric') {
    const { ref: asymmetricRef, isVisible: asymmetricVisible } = useReveal();
    return (
      <section ref={asymmetricRef} className="min-h-[80vh] sm:min-h-[85vh] relative overflow-hidden overflow-x-hidden">
        <DecorativeElements type={layout.decorative || 'gradient'} colors={theme.colors} />
        <div className="container mx-auto max-w-xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid grid-cols-1 gap-8 items-center overflow-x-hidden">
            <div>
              <div
                className={`transition-all duration-1000 ${easeOutQuart} ${asymmetricVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              >
                {tagline && (
                  <span
                    className="text-[10px] sm:text-xs tracking-[0.25em] uppercase mb-4 sm:mb-6 block break-words"
                    style={{ color: theme.colors?.accent || theme.colors?.muted }}
                  >
                    {tagline}
                  </span>
                )}
                <h1
                  className="font-semibold leading-[0.9] tracking-tight mb-6 sm:mb-8 break-words"
                  style={{
                    fontFamily: theme.fontPairing?.display,
                    fontSize: fluidType.hero,
                    color: theme.colors?.text
                  }}
                >
                  {headline}
                </h1>
              </div>
            </div>
            <div>
              <div
                className={`transition-all duration-1000 delay-200 ${easeOutQuart} ${asymmetricVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              >
                {subheadline && (
                  <p
                    className="leading-relaxed mb-6 sm:mb-8 max-w-lg break-words"
                    style={{
                      fontSize: fluidType.subheadline,
                      color: theme.colors?.muted,
                      fontFamily: theme.fontPairing?.body
                    }}
                  >
                    {subheadline}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button href={ctaHref} variant={section.cta?.variant || 'primary'} colors={theme.colors}>
                    {ctaText}
                  </Button>
                  {secondaryCtaText && secondaryCtaHref && (
                    <Button href={secondaryCtaHref} variant="ghost" colors={theme.colors}>
                      {secondaryCtaText}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Full-bleed layout - dramatic and immersive with enhanced responsive design
  if (section.style === 'fullbleed') {
    const { ref: sectionRef, isVisible: sectionVisible } = useReveal();
    return (
      <section ref={sectionRef} className="min-h-[85vh] sm:min-h-[90vh] relative flex items-end overflow-x-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${theme.colors?.background} 0%, ${theme.colors?.background}dd 40%, transparent 100%)`
          }}
        />
        <DecorativeElements type={layout.decorative || 'gradient'} colors={theme.colors} />
        <div className="container mx-auto max-w-xl px-4 sm:px-6 pb-16 sm:pb-24 relative z-10">
          <div className={`max-w-xl ${textAlign === 'left' ? 'text-left' : textAlign === 'right' ? 'text-right' : 'text-center mx-auto'}`}>
            <div
              className={`transition-all duration-1000 ${easeOutQuart} ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            >
              {tagline && (
                <span
                  className="text-[10px] sm:text-xs tracking-[0.25em] uppercase mb-4 block"
                  style={{ color: theme.colors?.accent || theme.colors?.muted }}
                >
                  {tagline}
                </span>
              )}
              <h1
                className="font-bold leading-[0.85] tracking-tighter mb-6 sm:mb-8 break-words"
                style={{
                  fontFamily: theme.fontPairing?.display,
                  fontSize: fluidType.hero,
                  color: theme.colors?.text
                }}
              >
                {headline}
              </h1>
            </div>
            <div
              className={`transition-all duration-1000 delay-200 ${easeOutQuart} ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            >
              {subheadline && (
                <p
                  className="max-w-xl mb-8 leading-relaxed break-words"
                  style={{
                    fontSize: fluidType.subheadline,
                    color: theme.colors?.muted,
                    fontFamily: theme.fontPairing?.body,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                >
                  {subheadline}
                </p>
              )}
              <div className="flex justify-center">
                <Button href={ctaHref} variant={section.cta?.variant || 'secondary'} colors={theme.colors}>
                  {ctaText}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Split layout - side by side with enhanced responsive behavior
  if (section.style === 'split') {
    const { ref, isVisible } = useReveal();
    return (
      <section ref={ref} className="min-h-[80vh] sm:min-h-[85vh] overflow-x-hidden">
        <div className="grid grid-cols-1 min-h-[80vh] sm:min-h-[85vh] overflow-x-hidden">
          <div className="flex items-center justify-center px-4 sm:px-8 lg:px-12 py-16 sm:py-24">
            <div className={`max-w-lg ${textAlign === 'left' ? 'text-left' : textAlign === 'right' ? 'text-right' : 'text-center'}`}>
              <div
                className={`transition-all duration-1000 ${easeOutQuart} ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
              >
                {tagline && (
                  <span
                    className="text-[10px] sm:text-xs tracking-[0.25em] uppercase mb-4 sm:mb-6 block break-words"
                    style={{ color: theme.colors?.accent || theme.colors?.muted }}
                  >
                    {tagline}
                  </span>
                )}
                <h1
                  className="font-medium leading-[0.95] tracking-tight mb-4 sm:mb-6 break-words"
                  style={{
                    fontFamily: theme.fontPairing?.display,
                    fontSize: fluidType.headline,
                    color: theme.colors?.text
                  }}
                >
                  {headline}
                </h1>
              </div>
              <div
                className={`transition-all duration-1000 delay-200 ${easeOutQuart} ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
              >
                {subheadline && (
                  <p
                    className="leading-relaxed mb-6 sm:mb-8 break-words"
                    style={{
                      fontSize: fluidType.subheadline,
                      color: theme.colors?.muted,
                      fontFamily: theme.fontPairing?.body
                    }}
                  >
                    {subheadline}
                  </p>
                )}
                <div className="flex gap-3 sm:gap-4 justify-center">
                  <Button href={ctaHref} variant={section.cta?.variant || 'primary'} colors={theme.colors}>
                    {ctaText}
                  </Button>
                  {secondaryCtaText && secondaryCtaHref && (
                    <Button href={secondaryCtaHref} variant="ghost" colors={theme.colors}>
                      {secondaryCtaText}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Minimal layout - extreme restraint with fluid typography
  if (section.style === 'minimal') {
    const { ref, isVisible } = useReveal();
    return (
      <section ref={ref} className="min-h-[70vh] sm:min-h-[75vh] flex items-center px-4 sm:px-6 overflow-x-hidden">
        <div className="container mx-auto max-w-xl">
          <div
            className={`text-center transition-all duration-1000 ${easeOutQuart} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          >
            <h1
              className="font-light leading-[1.1] tracking-tight mb-6 sm:mb-8 break-words"
              style={{
                fontFamily: theme.fontPairing?.display,
                fontSize: fluidType.headline,
                color: theme.colors?.text
              }}
            >
              {headline}
            </h1>
            {subheadline && (
              <p
                className="max-w-xl mx-auto leading-relaxed break-words"
                style={{
                  fontSize: fluidType.subheadline,
                  color: theme.colors?.muted,
                  fontFamily: theme.fontPairing?.body
                }}
              >
                {subheadline}
              </p>
            )}
            {ctaText && ctaHref && (
              <div className="mt-8 sm:mt-10">
                <a
                  href={ctaHref}
                  className="text-xs sm:text-sm tracking-wide hover:opacity-60 transition-opacity inline-flex items-center gap-2 group"
                  style={{ color: theme.colors?.text }}
                >
                  {ctaText}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Default centered layout - enhanced with fluid typography and better responsive behavior
  const { ref: defaultRef, isVisible: defaultVisible } = useReveal();
  return (
    <section ref={defaultRef} className={`min-h-[80vh] sm:min-h-[85vh] flex ${verticalClasses[verticalAlign]} px-4 sm:px-6 relative overflow-hidden overflow-x-hidden`}>
      <DecorativeElements type={layout.decorative || 'gradient'} colors={theme.colors} />
      <div className={`container mx-auto max-w-xl flex flex-col ${alignClasses[textAlign]}`}>
        <div
          className={`transition-all duration-1000 ${easeOutQuart} ${defaultVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        >
          {tagline && (
            <span
              className="text-[10px] sm:text-xs tracking-[0.25em] uppercase mb-4 sm:mb-6 block"
              style={{ color: theme.colors?.accent || theme.colors?.muted }}
            >
              {tagline}
            </span>
          )}
          <h1
            className="font-semibold leading-[0.9] tracking-tight break-words"
            style={{
              fontFamily: theme.fontPairing?.display,
              fontSize: fluidType.hero,
              color: theme.colors?.text
            }}
          >
            {headline}
          </h1>
        </div>
        <div
          className={`transition-all duration-1000 delay-150 ${easeOutQuart} ${defaultVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        >
          {subheadline && (
            <p
              className="mt-4 sm:mt-6 max-w-2xl leading-relaxed break-words"
              style={{
                fontSize: fluidType.subheadline,
                color: theme.colors?.muted,
                fontFamily: theme.fontPairing?.body,
                marginLeft: textAlign === 'center' ? 'auto' : '0',
                marginRight: textAlign === 'center' ? 'auto' : '0'
              }}
            >
              {subheadline}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-10 justify-center">
            <Button href={ctaHref} variant={section.cta?.variant || 'secondary'} colors={theme.colors}>
              {ctaText}
            </Button>
            {secondaryCtaText && secondaryCtaHref && (
              <Button href={secondaryCtaHref} variant="ghost" colors={theme.colors}>
                {secondaryCtaText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection({
  section,
  theme,
}: {
  section: Extract<Section, { type: 'about' }>;
  theme: Theme;
}) {
  const { ref: sectionRef, isVisible: sectionVisible } = useReveal();
  const layout = section.layout || 'editorial';

  // Ensure all content has fallbacks
  const heading = getContent(section.heading, defaultContent.about.heading);
  const body = getContent(section.body, defaultContent.about.body);

  // Editorial layout - magazine-style asymmetric with enhanced responsive design
  if (layout === 'editorial') {
    return (
      <section ref={sectionRef} className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        <div className="container mx-auto max-w-xl">
          <div className="grid grid-cols-1 gap-8 overflow-x-hidden">
            <div>
              <div
                className={`transition-all duration-1000 ${easeOutQuart} ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              >
                <span 
                  className="text-[10px] sm:text-xs tracking-[0.25em] uppercase block mb-4"
                  style={{ color: theme.colors?.accent || theme.colors?.muted }}
                >
                  About
                </span>
                <h2
                  className="font-light leading-tight break-words"
                  style={{
                    fontFamily: theme.fontPairing?.display,
                    fontSize: fluidType.headline,
                    color: theme.colors?.text
                  }}
                >
                  {heading}
                </h2>
              </div>
            </div>
            <div>
              <div
                className={`transition-all duration-1000 delay-200 ${easeOutQuart} ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              >
                <p
                  className="leading-relaxed mb-8 break-words"
                  style={{
                    fontSize: fluidType.body,
                    color: theme.colors?.text,
                    fontFamily: theme.fontPairing?.body
                  }}
                >
                  {body}
                </p>
                {section.stats && section.stats.length > 0 && (
                  <div
                    className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 pt-8 overflow-x-hidden"
                    style={{ borderTop: `1px solid ${theme.colors?.border || '#eee'}` }}
                  >
                    {section.stats.filter(s => s.value || s.label).map((stat, i) => (
                      <div key={i}>
                        <span
                          className="font-light block"
                          style={{
                            fontFamily: theme.fontPairing?.display,
                            fontSize: fluidType.headline,
                            color: theme.colors?.text
                          }}
                        >
                          {stat.value || '-'}
                        </span>
                        <span
                          className="text-xs sm:text-sm mt-2 block"
                          style={{ color: theme.colors?.muted }}
                        >
                          {stat.label || ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Split layout with image - enhanced responsive design
  if (layout === 'split' && section.avatarUrl) {
    const { ref: splitRef, isVisible: splitVisible } = useReveal();
    return (
      <section ref={splitRef} className="py-20 sm:py-28 lg:py-36 overflow-x-hidden">
        <div className="container mx-auto max-w-xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-8 items-center overflow-x-hidden">
            <div
              className={`transition-all duration-1000 ${easeOutQuart} ${splitVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}
            >
              <div 
                className="aspect-[4/5] relative overflow-hidden rounded-lg"
                style={{ backgroundColor: theme.colors?.surface }}
              >
                {section.avatarUrl ? (
                  <img src={section.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">◆</div>
                )}
              </div>
            </div>
            <div
              className={`transition-all duration-1000 delay-200 ${easeOutQuart} ${splitVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
            >
              <h2
                className="font-light mb-4 sm:mb-6"
                style={{
                  fontFamily: theme.fontPairing?.display,
                  fontSize: fluidType.headline,
                  color: theme.colors?.text
                }}
              >
                {heading}
              </h2>
              <p
                className="leading-relaxed break-words"
                style={{
                  fontSize: fluidType.body,
                  color: theme.colors?.muted,
                  fontFamily: theme.fontPairing?.body
                }}
              >
                {body}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Minimal layout - just text, no heading
  if (layout === 'minimal') {
    const { ref: minimalRef, isVisible: minimalVisible } = useReveal();
    return (
      <section ref={minimalRef} className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 overflow-x-hidden">
        <div className="container mx-auto max-w-xl">
          <div
            className={`transition-all duration-1000 ${easeOutQuart} ${minimalVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          >
            <p
              className="font-light leading-relaxed text-center break-words"
              style={{
                fontFamily: theme.fontPairing?.body,
                fontSize: fluidType.subheadline,
                color: theme.colors?.text
              }}
            >
              {body}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Standard layout - enhanced with responsive design
  const { ref: standardRef, isVisible: standardVisible } = useReveal();
  return (
    <section 
      ref={standardRef}
      className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6"
      style={{ backgroundColor: theme.colors?.surface || 'transparent' }}
    >
      <div className="container mx-auto max-w-3xl">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 overflow-x-hidden">
          <div className="text-center">
            <div
              className={`transition-all duration-1000 ${easeOutQuart} ${standardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            >
              <h2
                className="tracking-[0.2em] uppercase break-words"
                style={{
                  fontSize: fluidType.small,
                  color: theme.colors?.muted
                }}
              >
                {heading}
              </h2>
            </div>
          </div>
          <div>
            <div
              className={`transition-all duration-1000 delay-150 ${easeOutQuart} ${standardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            >
              <p
                className="leading-relaxed text-center max-w-2xl mx-auto break-words"
                style={{
                  fontSize: fluidType.body,
                  color: theme.colors?.text,
                  fontFamily: theme.fontPairing?.body
                }}
              >
                {body}
              </p>
              {section.stats && section.stats.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 mt-10 sm:mt-12 overflow-x-hidden">
                  {section.stats.filter(s => s.value || s.label).map((stat, i) => (
                    <div key={i} className="text-center">
                      <span
                        className="font-light block"
                        style={{
                          fontFamily: theme.fontPairing?.display,
                          fontSize: fluidType.headline,
                          color: theme.colors?.accent
                        }}
                      >
                        {stat.value || '-'}
                      </span>
                      <span
                        className="text-xs sm:text-sm mt-2 block"
                        style={{ color: theme.colors?.muted }}
                      >
                        {stat.label || ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectsSection({
  section,
  theme,
}: {
  section: Extract<Section, { type: 'projects' }>;
  theme: Theme;
}) {
  const { ref: sectionRef, isVisible: sectionVisible } = useReveal();
  const layout = section.layout || 'featured';
  const columns = section.columns || 2;

  // Ensure items always exist with fallbacks
  const items = getProjectItems(section.items);
  const heading = getContent(section.heading, defaultContent.projects.heading);

  const ProjectCard = ({ item, index }: { item: ProjectItem; index: number }) => {
    const { ref: cardRef, isVisible: cardVisible } = useReveal();
    const isLarge = item.size === 'large';
    const isFeatured = layout === 'featured' && index === 0;
    const cardColor = item.accentColor || theme.colors?.accent || theme.colors?.surface || '#f5f5f5';

    return (
      <div
        ref={cardRef}
        className={`transition-all duration-700 ${easeOutQuart} ${cardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        style={{ transitionDelay: `${index * 100}ms` }}
      >
        <a
          href={item.href || '#'}
          className="group block"
        >
          <div
            className={`relative overflow-hidden rounded-lg ${isFeatured ? 'aspect-[16/9] sm:aspect-[21/9]' : isLarge ? 'aspect-[4/3]' : 'aspect-square'}`}
            style={{ backgroundColor: cardColor }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `linear-gradient(135deg, ${cardColor}dd 0%, ${cardColor}88 100%)`
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity duration-500">
              <div className="text-center">
                <span className="text-4xl sm:text-5xl font-light" style={{ color: theme.colors?.background }}>
                  {item.title?.charAt(0) || '◆'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 sm:mt-6">
            <div className="flex items-start justify-between gap-4">
              <h3
                className="font-medium group-hover:opacity-70 transition-opacity leading-tight break-words"
                style={{
                  fontFamily: theme.fontPairing?.display,
                  fontSize: fluidType.body,
                  color: theme.colors?.text
                }}
              >
                {item.title || 'Project'}
              </h3>
              <span className="text-sm opacity-0 group-hover:opacity-70 transition-all duration-300 transform group-hover:translate-x-1" style={{ color: cardColor }}>→</span>
            </div>
            <p
              className="mt-2 line-clamp-2 leading-relaxed break-words"
              style={{
                fontSize: fluidType.small,
                color: theme.colors?.muted,
                fontFamily: theme.fontPairing?.body
              }}
            >
              {item.description || 'A showcase of craft and attention to detail.'}
            </p>
            {item.tags && item.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-3 sm:mt-4">
                {item.tags.slice(0, 3).map((tag: string) => (
                  <span
                    key={tag}
                    className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${cardColor}15`, color: cardColor }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </a>
      </div>
    );
  };

  // Featured layout - first item large, rest in grid
  if (layout === 'featured') {
    return (
      <section ref={sectionRef} className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        <div className="container mx-auto max-w-xl">
          <div className="mb-8 sm:mb-12">
            <div
              className={`transition-all duration-1000 ${easeOutQuart} ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            >
              <span
                className="text-[10px] sm:text-xs tracking-[0.25em] uppercase block mb-3 sm:mb-4"
                style={{ color: theme.colors?.accent || theme.colors?.muted }}
              >
                Work
              </span>
              <h2
                className="font-light"
                style={{
                  fontFamily: theme.fontPairing?.display,
                  fontSize: fluidType.headline,
                  color: theme.colors?.text
                }}
              >
                {heading}
              </h2>
              {section.subheading && (
                <p
                  className="mt-3 sm:mt-4 max-w-xl"
                  style={{
                    fontSize: fluidType.subheadline,
                    color: theme.colors?.muted
                  }}
                >
                  {section.subheading}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-6 sm:space-y-8">
            {items[0] && (
              <ProjectCard item={items[0]} index={0} />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 overflow-x-hidden">
              {items.slice(1).map((item, i) => (
                <ProjectCard key={item.id} item={item} index={i + 1} />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // List layout - clean vertical stack
  if (layout === 'list') {
    return (
      <section ref={sectionRef} className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        <div className="container mx-auto max-w-xl">
          <div className="mb-8 sm:mb-16">
            <div
              className={`transition-all duration-1000 ${easeOutQuart} ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            >
              <h2
                className="font-light"
                style={{
                  fontFamily: theme.fontPairing?.display,
                  fontSize: fluidType.headline,
                  color: theme.colors?.text
                }}
              >
                {heading}
              </h2>
            </div>
          </div>
          <div className="space-y-0">
            {items.map((item, i) => (
              <a
                key={item.id}
                href={item.href || '#'}
                className={`group flex items-center justify-between py-4 sm:py-6 border-b transition-all duration-700 ${easeOutQuart}`}
                style={{
                  borderColor: theme.colors?.border || '#eee',
                  transitionDelay: `${i * 100}ms`
                }}
              >
                <div className="flex items-center gap-3 sm:gap-6">
                  <span className="text-xs sm:text-sm" style={{ color: theme.colors?.muted }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3
                    className="font-light group-hover:translate-x-2 transition-transform"
                    style={{
                      fontFamily: theme.fontPairing?.display,
                      fontSize: fluidType.body,
                      color: theme.colors?.text
                    }}
                  >
                    {item.title || 'Project'}
                  </h3>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  {item.tags?.slice(0, 2).map((tag: string) => (
                    <span key={tag} className="text-[10px] sm:text-xs hidden sm:block" style={{ color: theme.colors?.muted }}>
                      {tag}
                    </span>
                  ))}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-sm sm:text-base">→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Grid layout - masonry-like
  return (
    <section ref={sectionRef} className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-8 sm:mb-12 flex items-end justify-between">
          <div
            className={`transition-all duration-1000 ${easeOutQuart} ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          >
            <h2
              className="font-light"
              style={{
                fontFamily: theme.fontPairing?.display,
                fontSize: fluidType.headline,
                color: theme.colors?.text
              }}
            >
              {heading}
            </h2>
          </div>
        </div>
        <div className={`grid gap-4 sm:gap-6 ${columns === 1 ? 'grid-cols-1' : columns === 3 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'} overflow-x-hidden`}>
          {items.map((item, i) => (
            <ProjectCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({
  section,
  theme,
}: {
  section: Extract<Section, { type: 'testimonials' }>;
  theme: Theme;
}) {
  const { ref: sectionRef, isVisible: sectionVisible } = useReveal();
  const layout = section.layout || 'masonry';

  // Ensure items always exist with fallbacks
  const items = getTestimonialItems(section.items as TestimonialItem[] | undefined);
  const heading = getContent(section.heading, defaultContent.testimonials.heading);

  // Masonry layout - varied card sizes with enhanced responsive design
  if (layout === 'masonry') {
    return (
      <section ref={sectionRef} className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        <div className="container mx-auto max-w-xl">
          <div className="mb-8 sm:mb-12">
            <div
              className={`transition-all duration-1000 ${easeOutQuart} ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            >
              <h2
                className="font-light"
                style={{
                  fontFamily: theme.fontPairing?.display,
                  fontSize: fluidType.headline,
                  color: theme.colors?.text
                }}
              >
                {heading}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 overflow-x-hidden">
            {items.map((item, i) => (
              <div
                key={item.id}
                className={`p-5 sm:p-6 lg:p-8 rounded-lg transition-all duration-700 ${easeOutQuart}`}
                style={{
                  backgroundColor: theme.colors?.surface || '#f5f5f5',
                  transitionDelay: `${i * 100}ms`
                }}
              >
                <p
                  className="leading-relaxed mb-4 sm:mb-6 break-words"
                  style={{
                    fontSize: fluidType.body,
                    fontFamily: theme.fontPairing?.body,
                    color: theme.colors?.text
                  }}
                >
                  &ldquo;{item.quote || 'Exceptional work.'}&rdquo;
                </p>
                <div>
                  <p
                    className="font-medium"
                    style={{
                      fontSize: fluidType.small,
                      color: theme.colors?.text
                    }}
                  >
                    {item.name || 'Client'}
                  </p>
                  {item.role && (
                    <p
                      className="mt-1"
                      style={{
                        fontSize: fluidType.small,
                        color: theme.colors?.muted
                      }}
                    >
                      {item.role}
                      {item.company && ` · ${item.company}`}
                    </p>
                  )}
                  {item.outcome && (
                    <p
                      className="mt-2"
                      style={{
                        fontSize: fluidType.small,
                        color: theme.colors?.accent
                      }}
                    >
                      {item.outcome}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Grid layout - uniform cards
  return (
    <section ref={sectionRef} className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-8 sm:mb-12">
          <div
            className={`transition-all duration-1000 ${easeOutQuart} ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          >
            <h2
              className="font-light"
              style={{
                fontFamily: theme.fontPairing?.display,
                fontSize: fluidType.headline,
                color: theme.colors?.text
              }}
            >
              {heading}
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`p-4 sm:p-6 rounded-lg transition-all duration-700 ${easeOutQuart}`}
              style={{
                backgroundColor: theme.colors?.surface || '#f5f5f5',
                transitionDelay: `${i * 100}ms`
              }}
            >
              <p
                className="leading-relaxed mb-3 sm:mb-4 break-words"
                style={{
                  fontSize: fluidType.body,
                  fontFamily: theme.fontPairing?.body,
                  color: theme.colors?.text
                }}
              >
                &ldquo;{item.quote || 'Exceptional work.'}&rdquo;
              </p>
              <div>
                <p
                  className="font-medium"
                  style={{
                    fontSize: fluidType.small,
                    color: theme.colors?.text
                  }}
                >
                  {item.name || 'Client'}
                </p>
                {item.role && (
                  <p
                    className="mt-1"
                    style={{
                      fontSize: fluidType.small,
                      color: theme.colors?.muted
                    }}
                  >
                    {item.role}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection({
  section,
  theme,
}: {
  section: Extract<Section, { type: 'contact' }>;
  theme: Theme;
}) {
  const { ref: sectionRef, isVisible: sectionVisible } = useReveal();
  const layout = section.layout || 'simple';

  // Fullbleed - dramatic large CTA with enhanced responsive design
  if (layout === 'fullbleed') {
    return (
      <section 
        ref={sectionRef}
        className="py-24 sm:py-32 lg:py-48 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: theme.colors?.primary, color: theme.colors?.background || '#fff' }}
      >
        <div className="container mx-auto max-w-xl">
          <div
            className={`transition-all duration-1000 ${easeOutQuart} ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          >
            <h2 
              className="font-light leading-[0.9] max-w-xl break-words"
              style={{ 
                fontFamily: theme.fontPairing?.display,
                fontSize: fluidType.hero,
                color: theme.colors?.background || '#fff'
              }}
            >
              {section.heading}
            </h2>
          </div>
          <div
            className={`mt-8 sm:mt-12 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-center transition-all duration-1000 delay-200 ${easeOutQuart} ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          >
            {section.email && (
              <a
                href={`mailto:${section.email}`}
                className="font-light hover:opacity-70 transition-opacity"
                style={{ 
                  fontFamily: theme.fontPairing?.display,
                  fontSize: fluidType.subheadline
                }}
              >
                {section.email}
              </a>
            )}
            {section.links && (
              <div className="flex gap-4 sm:gap-6">
                {section.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    className="text-xs sm:text-sm tracking-wide hover:opacity-70 transition-opacity uppercase"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Split layout - asymmetric with enhanced responsive design
  if (layout === 'split') {
    return (
      <section ref={sectionRef} className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        <div className="container mx-auto max-w-xl">
          <div className="grid grid-cols-1 gap-8 overflow-x-hidden">
            <div
              className={`transition-all duration-1000 ${easeOutQuart} ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            >
              <h2 
                className="font-light leading-tight"
                style={{ 
                  fontFamily: theme.fontPairing?.display,
                  fontSize: fluidType.headline,
                  color: theme.colors?.text
                }}
              >
                {section.heading}
              </h2>
              {section.subheading && (
                <p 
                  className="mt-3 sm:mt-4"
                  style={{ 
                    fontSize: fluidType.subheadline,
                    color: theme.colors?.muted 
                  }}
                >
                  {section.subheading}
                </p>
              )}
            </div>
            <div
              className={`flex flex-col justify-center transition-all duration-1000 delay-200 ${easeOutQuart} ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            >
              {section.email && (
                <a
                  href={`mailto:${section.email}`}
                  className="font-light hover:opacity-70 transition-opacity mb-4 sm:mb-8"
                  style={{ 
                    fontFamily: theme.fontPairing?.display, 
                    fontSize: fluidType.subheadline,
                    color: theme.colors?.accent 
                  }}
                >
                  {section.email}
                </a>
              )}
              {section.links && (
                <div className="flex flex-wrap gap-4 sm:gap-6">
                  {section.links.map((link, i) => (
                    <a
                      key={i}
                      href={link.href}
                      className="text-xs sm:text-sm hover:opacity-70 transition-opacity"
                      style={{ color: theme.colors?.muted }}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Card layout - contained box with enhanced responsive design
  if (layout === 'card') {
    return (
      <section ref={sectionRef} className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        <div className="container mx-auto max-w-xl">
          <div
            className={`p-6 sm:p-8 lg:p-12 xl:p-16 rounded-lg transition-all duration-1000 ${easeOutQuart} ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            style={{ backgroundColor: theme.colors?.surface || '#f5f5f5' }}
          >
            <h2 
              className="font-light mb-2 sm:mb-4"
              style={{ 
                fontFamily: theme.fontPairing?.display,
                fontSize: fluidType.headline,
                color: theme.colors?.text
              }}
            >
              {section.heading}
            </h2>
            {section.subheading && (
              <p 
                className="mb-4 sm:mb-8"
                style={{ 
                  fontSize: fluidType.body,
                  color: theme.colors?.muted 
                }}
              >
                {section.subheading}
              </p>
            )}
            {section.email && (
              <a
                href={`mailto:${section.email}`}
                className="hover:opacity-70 transition-opacity block mb-4 sm:mb-6"
                style={{ 
                  fontSize: fluidType.subheadline,
                  color: theme.colors?.accent 
                }}
              >
                {section.email}
              </a>
            )}
            {section.links && (
              <div 
                className="flex gap-3 sm:gap-4 pt-4 sm:pt-6"
                style={{ borderTop: `1px solid ${theme.colors?.border || '#ddd'}` }}
              >
                {section.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    className="text-xs sm:text-sm hover:opacity-70 transition-opacity"
                    style={{ color: theme.colors?.muted }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Simple layout - clean and minimal with enhanced responsive design
  return (
    <section ref={sectionRef} className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto text-center max-w-2xl">
        <div
          className={`transition-all duration-1000 ${easeOutQuart} ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        >
          <h2 
            className="font-light"
            style={{ 
              fontFamily: theme.fontPairing?.display,
              fontSize: fluidType.headline,
              color: theme.colors?.text
            }}
          >
            {section.heading}
          </h2>
          {section.subheading && (
            <p 
              className="mt-3 sm:mt-4"
              style={{ 
                fontSize: fluidType.subheadline,
                color: theme.colors?.muted 
              }}
            >
              {section.subheading}
            </p>
          )}
        </div>
        <div
          className={`mt-8 sm:mt-10 transition-all duration-1000 delay-150 ${easeOutQuart} ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        >
          {section.email && (
            <a
              href={`mailto:${section.email}`}
              className="inline-block hover:opacity-70 transition-opacity"
              style={{ 
                fontSize: fluidType.subheadline,
                color: theme.colors?.accent 
              }}
            >
              {section.email}
            </a>
          )}
        </div>
        {section.links && (
          <div
            className={`mt-6 sm:mt-8 flex gap-4 sm:gap-6 justify-center transition-all duration-1000 delay-300 ${easeOutQuart} ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          >
            {section.links.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className="text-xs sm:text-sm hover:opacity-70 transition-opacity"
                style={{ color: theme.colors?.muted }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function RawSection({
  section,
  theme,
}: {
  section: Extract<Section, { type: 'raw' }>;
  theme: Theme;
}) {
  return (
    <section className="py-24 px-6 lg:px-12"
      style={{ backgroundColor: theme.colors?.surface || 'transparent' }}>
      <div className="container mx-auto max-w-3xl">
        {section.label && (
          <h2 className="text-2xl font-light mb-4"
            style={{ fontFamily: theme.fontPairing?.display, color: theme.colors?.text }}>
            {section.label}
          </h2>
        )}
        <pre className="p-4 overflow-auto text-sm"
          style={{ backgroundColor: theme.colors?.background, color: theme.colors?.text }}>
          {JSON.stringify(section.content, null, 2)}
        </pre>
      </div>
    </section>
  );
}

function Navbar({ content }: { content: SiteContent }) {
  return (
    <nav
      className="px-6 lg:px-12 py-4"
      style={{
        backgroundColor: content.theme.colors?.background || '#fff',
        borderBottom: `1px solid ${content.theme.colors?.border || '#e5e5e5'}`,
      }}
    >
      <div className="container mx-auto flex items-center justify-between">
        <a
          href="/"
          className="text-lg font-medium hover:opacity-60 transition-opacity"
          style={{
            fontFamily: content.theme.fontPairing?.display,
            color: content.theme.colors?.text || '#000',
          }}
        >
          {content.meta?.title || 'Home'}
        </a>
      </div>
    </nav>
  );
}

// Subtle badge for free tier sites - drives referral traffic
function PoweredByBadge({ theme }: { theme: Theme }) {
  const accentColor = theme.colors?.accent || '#000';
  const textColor = theme.colors?.text || '#000';
  const bgColor = theme.colors?.surface || theme.colors?.background || '#fff';
  const borderColor = theme.colors?.border || '#e5e5e5';
  
  return (
    <a
      href="https://platforms.vercel.app?ref=badge"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-medium tracking-[0.15em] uppercase opacity-50 hover:opacity-100 transition-all duration-500 ease-out hover:scale-105 hover:shadow-lg"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        fontFamily: theme.fontPairing?.body || 'system-ui',
        boxShadow: `0 1px 3px rgba(0,0,0,0.08)`,
      }}
    >
      <span 
        className="w-1.5 h-1.5 rounded-full relative"
        style={{ 
          backgroundColor: accentColor,
          boxShadow: `0 0 8px ${accentColor}40`,
        }}
      >
        <span 
          className="absolute inset-0 rounded-full animate-ping"
          style={{ 
            backgroundColor: accentColor,
            opacity: 0.5,
          }}
        />
      </span>
      <span className="relative">
        Made with Platforms
      </span>
    </a>
  );
}

export function SiteRenderer({ content, showBadge = true }: { content: SiteContent; showBadge?: boolean }) {
  // Generate CSS variables for custom fonts and colors
  const fontStyles = content.theme.fontPairing ? {
    '--font-display': content.theme.fontPairing.display,
    '--font-body': content.theme.fontPairing.body,
  } as React.CSSProperties : {};

  return (
    <div
      className="w-full overflow-x-hidden"
      style={{
        backgroundColor: content.theme.colors?.background || '#fff',
        color: content.theme.colors?.text || '#000',
        ...fontStyles,
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
      }}
    >
      <Navbar content={content} />
      {content.sections.map((section) => {
        switch (section.type) {
          case 'hero':
            return <HeroSection key={section.id} section={section} theme={content.theme} />;
          case 'about':
            return <AboutSection key={section.id} section={section} theme={content.theme} />;
          case 'projects':
            return <ProjectsSection key={section.id} section={section} theme={content.theme} />;
          case 'testimonials':
            return <TestimonialsSection key={section.id} section={section} theme={content.theme} />;
          case 'contact':
            return <ContactSection key={section.id} section={section} theme={content.theme} />;
          case 'raw':
            return <RawSection key={section.id} section={section} theme={content.theme} />;
          default:
            return null;
        }
      })}
      {showBadge && <PoweredByBadge theme={content.theme} />}
    </div>
  );
}
