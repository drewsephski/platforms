import type { SiteContent, Section, Theme } from '@/lib/types/site';

interface ExportOptions {
  isWhiteLabel?: boolean;
}

/**
 * Generate standalone HTML from SiteContent
 * Creates a single-file HTML output with inlined styles
 */
export function generateStandaloneHTML(content: SiteContent, siteId: string, options?: ExportOptions): string {
  const { theme, meta, sections } = content;

  const fontStyles = theme.fontPairing ? `
    @import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(theme.fontPairing.display).replace(/ /g, '+')}&family=${encodeURIComponent(theme.fontPairing.body).replace(/ /g, '+')}&display=swap');
  ` : '';

  const css = generateCSS(theme);
  const bodyHTML = generateBodyHTML(sections, theme, options);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}">
  <style>
${fontStyles}
${css}
  </style>
</head>
<body>
${bodyHTML}
</body>
</html>`;
}

/**
 * Generate CSS from theme configuration
 */
function generateCSS(theme: Theme): string {
  const colors = theme.colors || {
    primary: '#1a1a1a',
    accent: '#c9a227',
    background: '#faf9f7',
    surface: '#f5f4f2',
    text: '#1a1a1a',
    muted: '#6b6b6b',
    border: '#e5e5e5',
  };

  const fontDisplay = theme.fontPairing?.display || 'system-ui';
  const fontBody = theme.fontPairing?.body || 'system-ui';

  return `
/* Reset & Base */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { 
  scroll-behavior: smooth;
  scroll-padding-top: 80px;
}
body {
  font-family: ${fontBody}, -apple-system, BlinkMacSystemFont, sans-serif;
  background: ${colors.background};
  color: ${colors.text};
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
a { color: inherit; text-decoration: none; }
img { max-width: 100%; height: auto; display: block; }

/* Typography Scale - Fluid */
.text-hero { 
  font-size: clamp(2.5rem, 8vw + 1rem, 6rem); 
  line-height: 0.95; 
  letter-spacing: -0.03em; 
  font-weight: 700;
}
.text-display { 
  font-size: clamp(2rem, 6vw + 1rem, 4.5rem); 
  line-height: 1; 
  letter-spacing: -0.025em; 
  font-weight: 600;
}
.text-headline { 
  font-size: clamp(1.5rem, 4vw + 0.5rem, 3rem); 
  line-height: 1.1; 
  letter-spacing: -0.02em;
  font-weight: 600;
}
.text-subheadline { 
  font-size: clamp(1.125rem, 2.5vw + 0.5rem, 1.75rem); 
  line-height: 1.4; 
  letter-spacing: -0.01em;
}
.text-body { 
  font-size: clamp(1rem, 1vw + 0.5rem, 1.125rem); 
  line-height: 1.7; 
}
.text-small { 
  font-size: clamp(0.875rem, 0.8vw + 0.4rem, 1rem); 
  line-height: 1.5; 
}
.text-caption {
  font-size: clamp(0.75rem, 0.6vw + 0.3rem, 0.875rem);
  line-height: 1.4;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Font Families */
.font-display { font-family: ${fontDisplay}, serif; }
.font-body { font-family: ${fontBody}, sans-serif; }

/* Design Tokens */
:root {
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2rem;
  --space-xl: 3rem;
  --space-2xl: 4rem;
  --space-3xl: 6rem;
  --space-4xl: 8rem;
  --space-section: clamp(4rem, 10vw, 7rem);
  
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-smooth: 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* Layout */
.container { 
  width: 100%; 
  max-width: 1400px; 
  margin: 0 auto; 
  padding: 0 clamp(1rem, 4vw, 2rem); 
}
.container-narrow {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 4vw, 2rem);
}
section { 
  padding: var(--space-section) 0; 
}

/* Colors */
.bg-primary { background-color: ${colors.primary}; }
.bg-accent { background-color: ${colors.accent}; }
.bg-background { background-color: ${colors.background}; }
.bg-surface { background-color: ${colors.surface}; }
.text-primary { color: ${colors.primary}; }
.text-accent { color: ${colors.accent}; }
.text-muted { color: ${colors.muted}; }
.border-accent { border-color: ${colors.accent}; }

/* Grid System */
.grid { display: grid; gap: var(--space-lg); }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }
.grid-auto-fit {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
}

@media (min-width: 640px) {
  .sm\\:grid-2 { grid-template-columns: repeat(2, 1fr); }
  .sm\\:grid-3 { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width: 768px) {
  .md\\:grid-2 { grid-template-columns: repeat(2, 1fr); }
  .md\\:grid-3 { grid-template-columns: repeat(3, 1fr); }
  .md\\:grid-4 { grid-template-columns: repeat(4, 1fr); }
}
@media (min-width: 1024px) {
  .lg\\:grid-2 { grid-template-columns: repeat(2, 1fr); }
  .lg\\:grid-3 { grid-template-columns: repeat(3, 1fr); }
  .lg\\:grid-4 { grid-template-columns: repeat(4, 1fr); }
}

/* Flex */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }
.gap-xs { gap: var(--space-xs); }
.gap-sm { gap: var(--space-sm); }
.gap-md { gap: var(--space-md); }
.gap-lg { gap: var(--space-lg); }
.gap-xl { gap: var(--space-xl); }

/* Spacing */
.mb-sm { margin-bottom: var(--space-sm); }
.mb-md { margin-bottom: var(--space-md); }
.mb-lg { margin-bottom: var(--space-lg); }
.mb-xl { margin-bottom: var(--space-xl); }
.mb-2xl { margin-bottom: var(--space-2xl); }
.mt-sm { margin-top: var(--space-sm); }
.mt-md { margin-top: var(--space-md); }
.mt-lg { margin-top: var(--space-lg); }
.mt-xl { margin-top: var(--space-xl); }
.py-sm { padding-top: var(--space-sm); padding-bottom: var(--space-sm); }
.py-md { padding-top: var(--space-md); padding-bottom: var(--space-md); }
.py-lg { padding-top: var(--space-lg); padding-bottom: var(--space-lg); }

/* Buttons - Modern */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  font-weight: 600;
  font-size: 0.9375rem;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  cursor: pointer;
  border: none;
  position: relative;
  overflow: hidden;
}
.btn:focus-visible {
  outline: 2px solid ${colors.accent};
  outline-offset: 2px;
}
.btn-primary {
  background-color: ${colors.accent};
  color: white;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}
.btn-primary:active {
  transform: translateY(0);
}
.btn-secondary {
  background-color: transparent;
  border: 2px solid ${colors.primary};
  color: ${colors.text};
}
.btn-secondary:hover {
  background-color: ${colors.primary};
  color: ${colors.background};
}
.btn-ghost {
  background-color: transparent;
  color: ${colors.text};
  padding: 0.625rem 1.25rem;
}
.btn-ghost:hover {
  background-color: ${colors.surface};
}

/* Cards - Enhanced */
.card {
  background: ${colors.surface};
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-smooth);
  position: relative;
}
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}
.card-content {
  padding: var(--space-lg);
}

/* Hero Section - Modern */
.hero {
  min-height: 90vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}
.hero-content { 
  max-width: 900px;
  position: relative;
  z-index: 1;
}
.hero-center {
  text-align: center;
  margin: 0 auto;
}
.hero-left {
  text-align: left;
}

/* Projects Grid - Enhanced */
.projects-grid {
  display: grid;
  gap: var(--space-xl);
  grid-template-columns: 1fr;
}
@media (min-width: 640px) {
  .projects-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .projects-grid { grid-template-columns: repeat(3, 1fr); }
}

.project-card {
  background: ${colors.surface};
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-smooth);
  position: relative;
  border: 1px solid ${colors.border};
}
.project-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
}
.project-image {
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%);
  position: relative;
  overflow: hidden;
}
.project-image::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.05) 100%);
}
.project-card-content { 
  padding: var(--space-lg); 
}
.project-title {
  font-family: ${fontDisplay}, serif;
  font-size: 1.375rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}
.project-description {
  color: ${colors.muted};
  margin-top: 0.75rem;
  line-height: 1.6;
}
.project-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}
.tag {
  font-size: 0.8125rem;
  padding: 0.375rem 0.875rem;
  background: ${colors.background};
  border-radius: 9999px;
  color: ${colors.text};
  font-weight: 500;
  border: 1px solid ${colors.border};
  transition: all var(--transition-fast);
}
.tag:hover {
  background: ${colors.accent};
  color: white;
  border-color: ${colors.accent};
}

/* Testimonials - Enhanced */
.testimonials-grid {
  display: grid;
  gap: var(--space-xl);
  grid-template-columns: 1fr;
}
@media (min-width: 768px) {
  .testimonials-grid { grid-template-columns: repeat(2, 1fr); }
}
.testimonial-card {
  background: ${colors.surface};
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  border: 1px solid ${colors.border};
  position: relative;
}
.testimonial-card::before {
  content: '"';
  position: absolute;
  top: var(--space-lg);
  left: var(--space-lg);
  font-size: 4rem;
  font-family: ${fontDisplay}, serif;
  color: ${colors.accent};
  opacity: 0.2;
  line-height: 1;
}
.testimonial-quote {
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: var(--space-lg);
  position: relative;
  font-style: normal;
}
.testimonial-author {
  font-weight: 600;
  font-size: 1.0625rem;
}
.testimonial-role {
  font-size: 0.9375rem;
  color: ${colors.muted};
  margin-top: 0.25rem;
}

/* Stats - Modern */
.stats-grid {
  display: grid;
  gap: var(--space-xl);
  grid-template-columns: repeat(2, 1fr);
}
@media (min-width: 640px) {
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(4, 1fr); }
}
.stat-item {
  text-align: left;
}
.stat-value {
  font-family: ${fontDisplay}, serif;
  font-size: clamp(2.5rem, 5vw + 1rem, 4rem);
  font-weight: 700;
  line-height: 1;
  color: ${colors.accent};
  letter-spacing: -0.02em;
}
.stat-label {
  font-size: 0.9375rem;
  color: ${colors.muted};
  margin-top: 0.5rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Contact Section - Enhanced */
.contact-section {
  background: ${colors.surface};
  padding: var(--space-3xl) 0;
}
.contact-grid {
  display: grid;
  gap: var(--space-2xl);
  grid-template-columns: 1fr;
}
@media (min-width: 768px) {
  .contact-grid { grid-template-columns: 1fr 1fr; }
}
.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: ${colors.text};
  transition: color var(--transition-fast);
}
.contact-link:hover {
  color: ${colors.accent};
}
.social-links {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
  margin-top: var(--space-md);
}
.social-link {
  padding: 0.75rem 1.5rem;
  background: ${colors.background};
  border: 1px solid ${colors.border};
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
  transition: all var(--transition-base);
}
.social-link:hover {
  background: ${colors.accent};
  color: white;
  border-color: ${colors.accent};
  transform: translateY(-2px);
}

/* Navigation - Modern */
.navbar {
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${colors.background};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid ${colors.border};
}
.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nav-logo {
  font-family: ${fontDisplay}, serif;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* Footer - Enhanced */
.footer {
  padding: var(--space-3xl) 0;
  border-top: 1px solid ${colors.border};
  text-align: center;
  color: ${colors.muted};
  font-size: 0.9375rem;
}

/* Utility Classes */
.text-center { text-align: center; }
.text-left { text-align: left; }
.leading-relaxed { line-height: 1.75; }
.tracking-tight { letter-spacing: -0.02em; }
.font-light { font-weight: 300; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.opacity-60 { opacity: 0.6; }
.opacity-80 { opacity: 0.8; }

/* Section Divider */
.divider {
  height: 1px;
  background: ${colors.border};
  margin: var(--space-2xl) 0;
}

/* Accent Colors for Projects - Modern */
.accent-blue { border-top: 4px solid #3b82f6; }
.accent-green { border-top: 4px solid #10b981; }
.accent-purple { border-top: 4px solid #8b5cf6; }
.accent-orange { border-top: 4px solid #f59e0b; }
.accent-red { border-top: 4px solid #ef4444; }
.accent-teal { border-top: 4px solid #14b8a6; }
.accent-pink { border-top: 4px solid #ec4899; }

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeInUp 0.6s var(--transition-smooth) forwards;
}

/* Responsive Images */
.responsive-image {
  width: 100%;
  height: auto;
  object-fit: cover;
}

/* Focus States */
a:focus-visible,
button:focus-visible {
  outline: 2px solid ${colors.accent};
  outline-offset: 2px;
}

/* Print Styles */
@media print {
  .navbar, .footer { display: none; }
  section { page-break-inside: avoid; }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`.trim();
}

/**
 * Generate body HTML from sections
 */
function generateBodyHTML(sections: Section[], theme: Theme, options?: ExportOptions): string {
  const colors = theme.colors || {
    primary: '#1a1a1a',
    accent: '#c9a227',
    background: '#faf9f7',
    surface: '#f5f4f2',
    text: '#1a1a1a',
    muted: '#6b6b6b',
    border: '#e5e5e5',
  };

  const fontDisplay = theme.fontPairing?.display || 'system-ui';

  let html = `
<nav class="navbar">
  <div class="container">
    <div class="nav-content">
      <a href="/" class="nav-logo" style="color: ${colors.text}">${escapeHtml(theme.preset || 'Home')}</a>
    </div>
  </div>
</nav>
<main>
`;

  for (const section of sections) {
    html += renderSection(section, theme, colors, fontDisplay);
  }

  html += `
</main>
${options?.isWhiteLabel ? '' : `<footer class="footer">
  <div class="container">
    <p class="text-muted">Made with Platforms</p>
  </div>
</footer>`}
`;

  return html;
}

/**
 * Render individual section based on type
 */
function renderSection(section: Section, theme: Theme, colors: any, fontDisplay: string): string {
  switch (section.type) {
    case 'hero':
      return renderHero(section, colors, fontDisplay);
    case 'about':
      return renderAbout(section, colors, fontDisplay);
    case 'projects':
      return renderProjects(section, colors, fontDisplay);
    case 'testimonials':
      return renderTestimonials(section, colors, fontDisplay);
    case 'contact':
      return renderContact(section, colors, fontDisplay);
    case 'raw':
      return renderRaw(section, colors);
    default:
      return '';
  }
}

function renderHero(section: Extract<Section, { type: 'hero' }>, colors: any, fontDisplay: string): string {
  const headline = section.headline || 'Welcome';
  const subheadline = section.subheadline || '';
  const tagline = section.tagline || '';
  const ctaText = section.cta?.text || 'Get Started';
  const ctaHref = section.cta?.href || '#contact';
  const secondaryCtaText = section.secondaryCta?.text || '';
  const secondaryCtaHref = section.secondaryCta?.href || '#';
  
  const textAlign = section.layout?.textAlign || 'center';
  const alignmentClass = textAlign === 'left' ? 'hero-left' : 'hero-center';

  return `
<section class="hero" style="background: ${colors.background}">
  <div class="container">
    <div class="hero-content ${alignmentClass} animate-fade-in">
      ${tagline ? `<p class="text-caption mb-md" style="color: ${colors.accent}">${escapeHtml(tagline)}</p>` : ''}
      <h1 class="text-hero font-display" style="color: ${colors.text}; font-family: ${fontDisplay}">${escapeHtml(headline)}</h1>
      ${subheadline ? `<p class="text-subheadline mt-lg mb-xl" style="color: ${colors.muted}; max-width: 600px; ${textAlign === 'center' ? 'margin-left: auto; margin-right: auto;' : ''}">${escapeHtml(subheadline)}</p>` : ''}
      <div class="flex gap-md mt-lg" style="${textAlign === 'center' ? 'justify-content: center;' : ''}">
        <a href="${escapeHtml(ctaHref)}" class="btn btn-primary">${escapeHtml(ctaText)}</a>
        ${secondaryCtaText ? `<a href="${escapeHtml(secondaryCtaHref)}" class="btn btn-secondary">${escapeHtml(secondaryCtaText)}</a>` : ''}
      </div>
    </div>
  </div>
</section>
`;
}

function renderAbout(section: Extract<Section, { type: 'about' }>, colors: any, fontDisplay: string): string {
  const heading = section.heading || 'About';
  const body = section.body || '';

  let statsHTML = '';
  if (section.stats && section.stats.length > 0) {
    const stats = section.stats.filter(s => s.value || s.label);
    if (stats.length > 0) {
      statsHTML = `
<div class="divider"></div>
<div class="stats-grid mt-xl">
  ${stats.map(stat => `
  <div class="stat-item">
    <div class="stat-value font-display" style="font-family: ${fontDisplay}">${escapeHtml(stat.value || '')}</div>
    <div class="stat-label">${escapeHtml(stat.label || '')}</div>
  </div>
  `).join('')}
</div>
`;
    }
  }

  return `
<section style="background: ${colors.background}">
  <div class="container-narrow">
    <div class="contact-grid">
      <div>
        <span class="text-caption" style="color: ${colors.accent}">About</span>
        <h2 class="text-headline font-display mt-md" style="color: ${colors.text}; font-family: ${fontDisplay}">${escapeHtml(heading)}</h2>
      </div>
      <div>
        <p class="text-body leading-relaxed" style="color: ${colors.text}">${escapeHtml(body)}</p>
        ${statsHTML}
      </div>
    </div>
  </div>
</section>
`;
}

function renderProjects(section: Extract<Section, { type: 'projects' }>, colors: any, fontDisplay: string): string {
  const heading = section.heading || 'Our Work';
  const subheading = section.subheading || '';
  const items = section.items || [];

  const accentClasses = ['accent-blue', 'accent-green', 'accent-purple', 'accent-orange', 'accent-red', 'accent-teal', 'accent-pink'];

  return `
<section style="background: ${colors.surface}">
  <div class="container">
    <div class="text-center mb-xl">
      ${subheading ? `<p class="text-caption mb-sm" style="color: ${colors.accent}">${escapeHtml(subheading)}</p>` : ''}
      <h2 class="text-headline font-display" style="color: ${colors.text}; font-family: ${fontDisplay}">${escapeHtml(heading)}</h2>
    </div>
    <div class="projects-grid">
      ${items.map((item, i) => `
      <article class="project-card card-hover ${accentClasses[i % accentClasses.length]}">
        ${item.imageUrl ? `<div class="project-image"><img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title || 'Project')}" class="responsive-image" /></div>` : ''}
        <div class="project-card-content">
          <h3 class="project-title" style="color: ${colors.text}; font-family: ${fontDisplay}">${escapeHtml(item.title || 'Project')}</h3>
          <p class="project-description">${escapeHtml(item.description || '')}</p>
          ${item.tags && item.tags.length > 0 ? `
          <div class="project-tags">
            ${item.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
          </div>
          ` : ''}
        </div>
      </article>
      `).join('')}
    </div>
  </div>
</section>
`;
}

function renderTestimonials(section: Extract<Section, { type: 'testimonials' }>, colors: any, fontDisplay: string): string {
  const heading = section.heading || 'What People Say';
  const subheading = section.subheading || '';
  const items = section.items || [];

  return `
<section style="background: ${colors.background}">
  <div class="container">
    <div class="text-center mb-xl">
      ${subheading ? `<p class="text-caption mb-sm" style="color: ${colors.accent}">${escapeHtml(subheading)}</p>` : ''}
      <h2 class="text-headline font-display" style="color: ${colors.text}; font-family: ${fontDisplay}">${escapeHtml(heading)}</h2>
    </div>
    <div class="testimonials-grid">
      ${items.map(item => `
      <blockquote class="testimonial-card card-hover">
        <p class="testimonial-quote" style="color: ${colors.text}">${escapeHtml(item.quote || '')}</p>
        <footer>
          <p class="testimonial-author" style="color: ${colors.text}">${escapeHtml(item.name || '')}</p>
          ${item.role ? `<p class="testimonial-role">${escapeHtml(item.role)}${item.company ? `, ${escapeHtml(item.company)}` : ''}</p>` : ''}
          ${item.outcome ? `<p class="text-small mt-sm" style="color: ${colors.accent}; font-weight: 600;">${escapeHtml(item.outcome)}</p>` : ''}
        </footer>
      </blockquote>
      `).join('')}
    </div>
  </div>
</section>
`;
}

function renderContact(section: Extract<Section, { type: 'contact' }>, colors: any, fontDisplay: string): string {
  const heading = section.heading || 'Get in Touch';
  const subheading = section.subheading || '';
  const email = section.email || '';
  const phone = section.phone || '';
  const location = section.location || '';
  const links = section.links || [];

  return `
<section class="contact-section">
  <div class="container">
    <div class="contact-grid">
      <div>
        <span class="text-caption" style="color: ${colors.accent}">Contact</span>
        <h2 class="text-headline font-display mt-md" style="color: ${colors.text}; font-family: ${fontDisplay}">${escapeHtml(heading)}</h2>
        ${subheading ? `<p class="text-body mt-lg leading-relaxed" style="color: ${colors.muted}">${escapeHtml(subheading)}</p>` : ''}
      </div>
      <div class="mt-lg md:mt-0">
        ${email ? `<a href="mailto:${escapeHtml(email)}" class="contact-link text-body font-semibold">${escapeHtml(email)}</a>` : ''}
        ${phone ? `<p class="text-body mt-md" style="color: ${colors.text}">${escapeHtml(phone)}</p>` : ''}
        ${location ? `<p class="text-body mt-md" style="color: ${colors.muted}">${escapeHtml(location)}</p>` : ''}
        ${links && links.length > 0 ? `
        <div class="social-links">
          ${links.map(link => `<a href="${escapeHtml(link.href || '#')}" class="social-link">${escapeHtml(link.label || 'Link')}</a>`).join('')}
        </div>
        ` : ''}
      </div>
    </div>
  </div>
</section>
`;
}

function renderRaw(section: Extract<Section, { type: 'raw' }>, colors: any): string {
  return `
<section style="background: ${colors.surface}">
  <div class="container">
    <pre style="background: ${colors.background}; padding: 1.5rem; border-radius: 0.5rem; overflow: auto; font-size: 0.875rem;">${escapeHtml(JSON.stringify(section.content, null, 2))}</pre>
  </div>
</section>
`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
