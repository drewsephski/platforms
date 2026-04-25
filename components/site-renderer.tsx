'use client';

import type { SiteContent, Section, Theme } from '@/lib/types/site';
import { useEffect, useState } from 'react';

// Animation helper - staggered reveal
function useStaggeredReveal(itemCount: number, baseDelay = 100) {
  const [visible, setVisible] = useState<boolean[]>(new Array(itemCount).fill(false));

  useEffect(() => {
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
  }, [itemCount, baseDelay]);

  return visible;
}

// Decorative elements based on aesthetic
function DecorativeElements({ type, colors }: { type: string; colors?: Theme['colors'] }) {
  if (type === 'shapes') {
    return (
      <>
        <div className="absolute top-20 right-10 w-32 h-32 rounded-full opacity-20"
          style={{ background: colors?.accent || '#000' }} />
        <div className="absolute bottom-40 left-20 w-24 h-24 rotate-45 opacity-10"
          style={{ background: colors?.primary || '#000' }} />
      </>
    );
  }
  if (type === 'lines') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
        <line x1="10%" y1="0" x2="10%" y2="100%" stroke="currentColor" strokeWidth="1" />
        <line x1="90%" y1="0" x2="90%" y2="100%" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }
  if (type === 'gradient') {
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 70% 30%, ${colors?.accent}20 0%, transparent 50%)`,
        }}
      />
    );
  }
  return null;
}

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
  const baseStyles = "inline-flex items-center font-medium transition-all duration-200 ease-out";

  const variants = {
    primary: `px-8 py-4 text-base tracking-wide hover:opacity-90`,
    secondary: `px-6 py-3 border-2 text-sm hover:bg-opacity-10 hover:bg-black`,
    ghost: `px-6 py-3 text-sm hover:underline underline-offset-4`,
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
  const layout = section.layout || { textAlign: 'center', verticalAlign: 'center', decorative: 'none' };
  const textAlign = layout.textAlign || 'center';
  const verticalAlign = layout.verticalAlign || 'center';
  const visible = useStaggeredReveal(4, 150);

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

  // Asymmetric layout - breaks the grid
  if (section.style === 'asymmetric') {
    return (
      <section className="min-h-[70vh] relative overflow-hidden">
        <DecorativeElements type={layout.decorative || 'gradient'} colors={theme.colors} />
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-1 gap-8 items-center">
            <div className="text-center">
              <div
                className={`transition-all duration-700 ease-out-quart ${visible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                {section.tagline && (
                  <span className="text-xs tracking-[0.2em] uppercase mb-3 block"
                    style={{ color: theme.colors?.muted }}>
                    {section.tagline}
                  </span>
                )}
                <h1 className="text-3xl font-light leading-[0.95] tracking-tight"
                  style={{ fontFamily: theme.fontPairing?.display }}>
                  {section.headline}
                </h1>
              </div>
            </div>
            <div className="text-center">
              <div
                className={`transition-all duration-700 delay-300 ease-out-quart ${visible[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                {section.subheadline && (
                  <p className="text-sm leading-relaxed mb-4"
                    style={{ color: theme.colors?.muted, fontFamily: theme.fontPairing?.body }}>
                    {section.subheadline}
                  </p>
                )}
                <div className="flex flex-col gap-3 justify-center">
                  {section.cta && (
                    <Button href={section.cta.href} variant={section.cta.variant || 'primary'} colors={theme.colors}>
                      {section.cta.text}
                    </Button>
                  )}
                  {section.secondaryCta && (
                    <Button href={section.secondaryCta.href} variant="ghost" colors={theme.colors}>
                      {section.secondaryCta.text}
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

  // Full-bleed layout - dramatic and immersive
  if (section.style === 'fullbleed') {
    return (
      <section className="min-h-[70vh] relative flex items-end">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="container mx-auto max-w-7xl px-4 pb-16 relative z-10">
          <div className="max-w-4xl text-center">
            <div
              className={`transition-all duration-700 ease-out-quart ${visible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              {section.tagline && (
                <span className="text-[10px] tracking-[0.3em] uppercase mb-2 block"
                  style={{ color: theme.colors?.muted }}>
                  {section.tagline}
                </span>
              )}
              <h1 className="text-3xl font-bold tracking-tighter leading-[0.9] mb-4"
                style={{ fontFamily: theme.fontPairing?.display }}>
                {section.headline}
              </h1>
            </div>
            <div
              className={`transition-all duration-700 delay-200 ease-out-quart ${visible[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              {section.subheadline && (
                <p className="text-base max-w-xl mx-auto mb-6"
                  style={{ color: theme.colors?.muted, fontFamily: theme.fontPairing?.body }}>
                  {section.subheadline}
                </p>
              )}
              {section.cta && (
                <div className="flex justify-center">
                  <Button href={section.cta.href} variant={section.cta.variant || 'secondary'} colors={theme.colors}>
                    {section.cta.text}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Split layout - side by side
  if (section.style === 'split') {
    return (
      <section className="min-h-[70vh]">
        <div className="grid grid-cols-1 min-h-[70vh]">
          <div className="flex items-center justify-center px-4 py-12">
            <div className="max-w-lg text-center">
              <div
                className={`transition-all duration-700 ease-out-quart ${visible[0] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
              >
                {section.tagline && (
                  <span className="text-xs tracking-[0.2em] uppercase mb-3 block"
                    style={{ color: theme.colors?.accent }}>
                    {section.tagline}
                  </span>
                )}
                <h1 className="text-2xl font-medium leading-[1.1] tracking-tight mb-4"
                  style={{ fontFamily: theme.fontPairing?.display }}>
                  {section.headline}
                </h1>
              </div>
              <div
                className={`transition-all duration-700 delay-200 ease-out-quart ${visible[1] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
              >
                {section.subheadline && (
                  <p className="text-sm leading-relaxed mb-6"
                    style={{ color: theme.colors?.muted, fontFamily: theme.fontPairing?.body }}>
                    {section.subheadline}
                  </p>
                )}
                <div className="flex gap-3 justify-center">
                  {section.cta && (
                    <Button href={section.cta.href} variant={section.cta.variant || 'primary'} colors={theme.colors}>
                      {section.cta.text}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="hidden relative"
            style={{ backgroundColor: theme.colors?.surface || '#f5f5f5' }}>
            <DecorativeElements type={layout.decorative || 'shapes'} colors={theme.colors} />
          </div>
        </div>
      </section>
    );
  }

  // Minimal layout - extreme restraint
  if (section.style === 'minimal') {
    return (
      <section className="min-h-[60vh] flex items-center px-4">
        <div className="container mx-auto">
          <div
            className={`max-w-2xl text-center transition-all duration-700 ease-out-quart ${visible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <h1 className="text-2xl font-light leading-tight tracking-tight"
              style={{ fontFamily: theme.fontPairing?.display }}>
              {section.headline}
            </h1>
            {section.subheadline && (
              <p className="mt-4 text-sm"
                style={{ color: theme.colors?.muted, fontFamily: theme.fontPairing?.body }}>
                {section.subheadline}
              </p>
            )}
            {section.cta && (
              <div className="mt-8">
                <a
                  href={section.cta.href}
                  className="text-xs tracking-wide hover:opacity-60 transition-opacity"
                  style={{ color: theme.colors?.text }}
                >
                  {section.cta.text} →
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Default centered layout (but better)
  return (
    <section className={`min-h-[70vh] flex ${verticalClasses[verticalAlign]} px-4 relative overflow-hidden`}>
      <DecorativeElements type={layout.decorative || 'none'} colors={theme.colors} />
      <div className={`container mx-auto max-w-5xl flex flex-col ${alignClasses[textAlign]}`}>
        <div
          className={`transition-all duration-700 ease-out-quart ${visible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {section.tagline && (
            <span className="text-[10px] tracking-[0.3em] uppercase mb-4 block"
              style={{ color: theme.colors?.accent }}>
              {section.tagline}
            </span>
          )}
          <h1 className="text-3xl font-medium tracking-tight leading-[0.95]"
            style={{ fontFamily: theme.fontPairing?.display }}>
            {section.headline}
          </h1>
        </div>
        <div
          className={`transition-all duration-700 delay-150 ease-out-quart ${visible[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {section.subheadline && (
            <p className="mt-4 text-base max-w-2xl mx-auto"
              style={{ color: theme.colors?.muted, fontFamily: theme.fontPairing?.body }}>
              {section.subheadline}
            </p>
          )}
          {section.cta && (
            <div className="flex justify-center">
              <Button href={section.cta.href} variant={section.cta.variant || 'secondary'} colors={theme.colors}>
                {section.cta.text}
              </Button>
            </div>
          )}
          {section.secondaryCta && (
            <Button href={section.secondaryCta.href} variant="ghost" colors={theme.colors}>
              {section.secondaryCta.text}
            </Button>
          )}
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
  const visible = useStaggeredReveal(3, 100);
  const layout = section.layout || 'standard';

  // Editorial layout - magazine-style asymmetric
  if (layout === 'editorial') {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8">
            <div className="text-center">
              <div
                className={`transition-all duration-700 ease-out-quart ${visible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                <span className="text-[10px] tracking-[0.3em] uppercase block mb-2"
                  style={{ color: theme.colors?.muted }}>About</span>
                <h2 className="text-2xl font-light leading-tight"
                  style={{ fontFamily: theme.fontPairing?.display }}>
                  {section.heading}
                </h2>
              </div>
            </div>
            <div>
              <div
                className={`transition-all duration-700 delay-200 ease-out-quart ${visible[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                <p className="text-base leading-relaxed"
                  style={{ color: theme.colors?.text, fontFamily: theme.fontPairing?.body }}>
                  {section.body}
                </p>
                {section.stats && (
                  <div className="flex flex-wrap gap-4 mt-8 pt-8"
                    style={{ borderTop: `1px solid ${theme.colors?.border || '#eee'}` }}>
                    {section.stats.map((stat, i) => (
                      <div key={i}>
                        <span className="text-xl font-light block"
                          style={{ fontFamily: theme.fontPairing?.display }}>
                          {stat.value}
                        </span>
                        <span className="text-xs mt-1 block" style={{ color: theme.colors?.muted }}>
                          {stat.label}
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

  // Split layout with image
  if (layout === 'split' && section.avatarUrl) {
    return (
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 gap-8 items-center">
            <div
              className={`transition-all duration-700 ease-out-quart ${visible[0] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
            >
              <div className="aspect-[4/5] relative overflow-hidden"
                style={{ backgroundColor: theme.colors?.surface }}>
                {section.avatarUrl ? (
                  <img src={section.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20">◆</div>
                )}
              </div>
            </div>
            <div
              className={`transition-all duration-700 delay-200 ease-out-quart ${visible[1] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
            >
              <h2 className="text-2xl font-light mb-4"
                style={{ fontFamily: theme.fontPairing?.display }}>
                {section.heading}
              </h2>
              <p className="text-sm leading-relaxed"
                style={{ color: theme.colors?.muted, fontFamily: theme.fontPairing?.body }}>
                {section.body}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Minimal layout - just text, no heading
  if (layout === 'minimal') {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <div
            className={`transition-all duration-700 ease-out-quart ${visible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <p className="text-lg font-light leading-relaxed text-center"
              style={{ fontFamily: theme.fontPairing?.body }}>
              {section.body}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Standard layout - improved
  return (
    <section className="py-16 px-4"
      style={{ backgroundColor: theme.colors?.surface || 'transparent' }}>
      <div className="container mx-auto max-w-4xl">
        <div className="grid grid-cols-1 gap-6">
          <div className="text-center">
            <div
              className={`transition-all duration-700 ease-out-quart ${visible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <h2 className="text-xs tracking-[0.2em] uppercase"
                style={{ color: theme.colors?.muted }}>
                {section.heading}
              </h2>
            </div>
          </div>
          <div>
            <div
              className={`transition-all duration-700 delay-150 ease-out-quart ${visible[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <p className="text-base leading-relaxed"
                style={{ color: theme.colors?.text, fontFamily: theme.fontPairing?.body }}>
                {section.body}
              </p>
              {section.stats && (
                <div className="flex flex-wrap gap-6 mt-8 justify-center">
                  {section.stats.map((stat, i) => (
                    <div key={i}>
                      <span className="text-xl font-light block"
                        style={{ fontFamily: theme.fontPairing?.display, color: theme.colors?.accent }}>
                        {stat.value}
                      </span>
                      <span className="text-xs mt-1 block" style={{ color: theme.colors?.muted }}>
                        {stat.label}
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
  const visible = useStaggeredReveal(section.items.length + 2, 100);
  const layout = section.layout || 'grid';
  const columns = section.columns || 2;

  const ProjectCard = ({ item, index }: { item: typeof section.items[0]; index: number }) => {
    const isLarge = item.size === 'large';
    const isFeatured = layout === 'featured' && index === 0;

    return (
      <a
        href={item.href || '#'}
        className={`group block transition-all duration-500 ease-out-quart ${visible[index + 1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className={`relative overflow-hidden ${isFeatured ? 'aspect-[21/9]' : isLarge ? 'aspect-[4/3]' : 'aspect-square'}`}
          style={{ backgroundColor: item.accentColor || theme.colors?.surface || '#f5f5f5' }}>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <span className="text-6xl">◆</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="mt-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-medium group-hover:opacity-60 transition-opacity"
              style={{ fontFamily: theme.fontPairing?.display }}>
              {item.title}
            </h3>
            <span className="text-sm opacity-0 group-hover:opacity-60 transition-opacity">→</span>
          </div>
          <p className="text-sm mt-1 line-clamp-2"
            style={{ color: theme.colors?.muted, fontFamily: theme.fontPairing?.body }}>
            {item.description}
          </p>
          {item.tags && (
            <div className="flex gap-2 flex-wrap mt-3">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1"
                  style={{ backgroundColor: theme.colors?.surface, color: theme.colors?.muted }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </a>
    );
  };

  // Featured layout - first item large, rest in grid
  if (layout === 'featured') {
    return (
      <section className="py-16 lg:py-24 xl:py-32 px-4 sm:px-6 lg:px-12">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8 sm:mb-12">
            <div
              className={`transition-all duration-700 ease-out-quart ${visible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase block mb-2 sm:mb-4"
                style={{ color: theme.colors?.muted }}>Work</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light"
                style={{ fontFamily: theme.fontPairing?.display }}>
                {section.heading}
              </h2>
              {section.subheading && (
                <p className="text-sm sm:text-base md:text-lg mt-2 sm:mt-4 max-w-xl" style={{ color: theme.colors?.muted }}>
                  {section.subheading}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-6 sm:space-y-8">
            {section.items[0] && (
              <ProjectCard item={section.items[0]} index={0} />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              {section.items.slice(1).map((item, i) => (
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
      <section className="py-16 lg:py-24 xl:py-32 px-4 sm:px-6 lg:px-12">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8 sm:mb-16">
            <div
              className={`transition-all duration-700 ease-out-quart ${visible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light" style={{ fontFamily: theme.fontPairing?.display }}>
                {section.heading}
              </h2>
            </div>
          </div>
          <div className="space-y-0">
            {section.items.map((item, i) => (
              <a
                key={item.id}
                href={item.href || '#'}
                className={`group flex items-center justify-between py-4 sm:py-6 border-b transition-all duration-500 ease-out-quart ${visible[i + 1] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ borderColor: theme.colors?.border || '#eee' }}
              >
                <div className="flex items-center gap-3 sm:gap-6">
                  <span className="text-xs sm:text-sm" style={{ color: theme.colors?.muted }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-base sm:text-lg md:text-xl font-light group-hover:translate-x-2 transition-transform"
                    style={{ fontFamily: theme.fontPairing?.display }}>
                    {item.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  {item.tags?.slice(0, 2).map(tag => (
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
    <section className="py-16 lg:py-24 xl:py-32 px-4 sm:px-6 lg:px-12">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 sm:mb-12 flex items-end justify-between">
          <div
            className={`transition-all duration-700 ease-out-quart ${visible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light"
              style={{ fontFamily: theme.fontPairing?.display }}>
              {section.heading}
            </h2>
          </div>
        </div>
        <div className={`grid gap-4 sm:gap-6 lg:gap-8 ${columns === 1 ? 'grid-cols-1' : columns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {section.items.map((item, i) => (
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
  const visible = useStaggeredReveal(section.items.length + 1, 100);
  const layout = section.layout || 'grid';

  // Masonry layout - varied card sizes
  if (layout === 'masonry') {
    return (
      <section className="py-16 lg:py-24 xl:py-32 px-4 sm:px-6 lg:px-12">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8 sm:mb-12">
            <div
              className={`transition-all duration-700 ease-out-quart ${visible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light"
                style={{ fontFamily: theme.fontPairing?.display }}>
                {section.heading}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {section.items.map((item, i) => (
              <div
                key={item.id}
                className={`p-4 sm:p-6 lg:p-8 transition-all duration-700 ease-out-quart ${visible[i + 1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ backgroundColor: theme.colors?.surface || '#f5f5f5' }}
              >
                <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6"
                  style={{ fontFamily: theme.fontPairing?.body, color: theme.colors?.text }}>
                  "{item.quote}"
                </p>
                <div>
                  <p className="text-sm sm:text-base font-medium" style={{ color: theme.colors?.text }}>
                    {item.name}
                  </p>
                  {item.role && (
                    <p className="text-xs sm:text-sm mt-1" style={{ color: theme.colors?.muted }}>
                      {item.role}
                      {item.company && ` · ${item.company}`}
                    </p>
                  )}
                  {item.outcome && (
                    <p className="text-xs sm:text-sm mt-2" style={{ color: theme.colors?.accent }}>
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
    <section className="py-16 lg:py-24 xl:py-32 px-4 sm:px-6 lg:px-12">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 sm:mb-12">
          <div
            className={`transition-all duration-700 ease-out-quart ${visible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light"
              style={{ fontFamily: theme.fontPairing?.display }}>
              {section.heading}
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {section.items.map((item, i) => (
            <div
              key={item.id}
              className={`p-4 sm:p-6 transition-all duration-700 ease-out-quart ${visible[i + 1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ backgroundColor: theme.colors?.surface || '#f5f5f5' }}
            >
              <p className="text-sm sm:text-base leading-relaxed mb-3 sm:mb-4"
                style={{ fontFamily: theme.fontPairing?.body, color: theme.colors?.text }}>
                "{item.quote}"
              </p>
              <div>
                <p className="font-medium text-xs sm:text-sm" style={{ color: theme.colors?.text }}>
                  {item.name}
                </p>
                {item.role && (
                  <p className="text-[10px] sm:text-xs mt-1" style={{ color: theme.colors?.muted }}>
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
  const visible = useStaggeredReveal(3, 150);
  const layout = section.layout || 'simple';

  // Fullbleed - dramatic large CTA
  if (layout === 'fullbleed') {
    return (
      <section className="py-20 lg:py-32 xl:py-48 px-4 sm:px-6 lg:px-12"
        style={{ backgroundColor: theme.colors?.primary, color: theme.colors?.background || '#fff' }}>
        <div className="container mx-auto max-w-7xl">
          <div
            className={`transition-all duration-700 ease-out-quart ${visible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light leading-[0.9] sm:leading-[0.85] max-w-4xl"
              style={{ fontFamily: theme.fontPairing?.display }}>
              {section.heading}
            </h2>
          </div>
          <div
            className={`mt-8 sm:mt-12 flex flex-col sm:flex-wrap sm:flex-row gap-6 sm:gap-8 items-start sm:items-center transition-all duration-700 delay-200 ease-out-quart ${visible[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            {section.email && (
              <a
                href={`mailto:${section.email}`}
                className="text-xl sm:text-2xl md:text-3xl font-light hover:opacity-60 transition-opacity"
                style={{ fontFamily: theme.fontPairing?.display }}
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
                    className="text-xs sm:text-sm tracking-wide hover:opacity-60 transition-opacity uppercase"
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

  // Split layout - asymmetric
  if (layout === 'split') {
    return (
      <section className="py-16 lg:py-24 xl:py-32 px-4 sm:px-6 lg:px-12">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-24">
            <div
              className={`transition-all duration-700 ease-out-quart ${visible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light leading-tight"
                style={{ fontFamily: theme.fontPairing?.display }}>
                {section.heading}
              </h2>
              {section.subheading && (
                <p className="text-sm sm:text-base md:text-lg mt-2 sm:mt-4" style={{ color: theme.colors?.muted }}>
                  {section.subheading}
                </p>
              )}
            </div>
            <div
              className={`flex flex-col justify-center transition-all duration-700 delay-200 ease-out-quart ${visible[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              {section.email && (
                <a
                  href={`mailto:${section.email}`}
                  className="text-lg sm:text-xl md:text-2xl font-light hover:opacity-60 transition-opacity mb-4 sm:mb-8"
                  style={{ fontFamily: theme.fontPairing?.display, color: theme.colors?.accent }}
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
                      className="text-xs sm:text-sm hover:opacity-60 transition-opacity"
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

  // Card layout - contained box
  if (layout === 'card') {
    return (
      <section className="py-16 lg:py-24 xl:py-32 px-4 sm:px-6 lg:px-12">
        <div className="container mx-auto max-w-2xl">
          <div
            className={`p-6 sm:p-8 lg:p-12 xl:p-16 transition-all duration-700 ease-out-quart ${visible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ backgroundColor: theme.colors?.surface || '#f5f5f5' }}>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light mb-2 sm:mb-4"
              style={{ fontFamily: theme.fontPairing?.display }}>
              {section.heading}
            </h2>
            {section.subheading && (
              <p className="text-sm sm:text-base mb-4 sm:mb-8" style={{ color: theme.colors?.muted }}>
                {section.subheading}
              </p>
            )}
            {section.email && (
              <a
                href={`mailto:${section.email}`}
                className="text-base sm:text-lg hover:opacity-60 transition-opacity block mb-4 sm:mb-6"
                style={{ color: theme.colors?.accent }}
              >
                {section.email}
              </a>
            )}
            {section.links && (
              <div className="flex gap-3 sm:gap-4 pt-4 sm:pt-6"
                style={{ borderTop: `1px solid ${theme.colors?.border || '#ddd'}` }}>
                {section.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    className="text-xs sm:text-sm hover:opacity-60 transition-opacity"
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

  // Simple layout - clean and minimal
  return (
    <section className="py-16 lg:py-24 xl:py-32 px-4 sm:px-6 lg:px-12">
      <div className="container mx-auto text-center max-w-2xl">
        <div
          className={`transition-all duration-700 ease-out-quart ${visible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light"
            style={{ fontFamily: theme.fontPairing?.display }}>
            {section.heading}
          </h2>
          {section.subheading && (
            <p className="text-sm sm:text-base md:text-lg mt-2 sm:mt-4" style={{ color: theme.colors?.muted }}>
              {section.subheading}
            </p>
          )}
        </div>
        <div
          className={`mt-6 sm:mt-10 transition-all duration-700 delay-150 ease-out-quart ${visible[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {section.email && (
            <a
              href={`mailto:${section.email}`}
              className="inline-block text-lg sm:text-xl hover:opacity-60 transition-opacity"
              style={{ color: theme.colors?.accent }}
            >
              {section.email}
            </a>
          )}
        </div>
        {section.links && (
          <div
            className={`mt-6 sm:mt-8 flex gap-4 sm:gap-6 justify-center transition-all duration-700 delay-300 ease-out-quart ${visible[2] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            {section.links.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className="text-xs sm:text-sm hover:opacity-60 transition-opacity"
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
      <div className="container mx-auto max-w-4xl">
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

export function SiteRenderer({ content }: { content: SiteContent }) {
  // Generate CSS variables for custom fonts and colors
  const fontStyles = content.theme.fontPairing ? {
    '--font-display': content.theme.fontPairing.display,
    '--font-body': content.theme.fontPairing.body,
  } as React.CSSProperties : {};

  return (
    <div
      style={{
        backgroundColor: content.theme.colors?.background || '#fff',
        color: content.theme.colors?.text || '#000',
        ...fontStyles,
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
    </div>
  );
}
