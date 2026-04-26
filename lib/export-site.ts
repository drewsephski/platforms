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
html { scroll-behavior: smooth; }
body {
  font-family: ${fontBody}, -apple-system, BlinkMacSystemFont, sans-serif;
  background: ${colors.background};
  color: ${colors.text};
  line-height: 1.6;
}
a { color: inherit; text-decoration: none; }
img { max-width: 100%; height: auto; display: block; }

/* Typography Scale */
.text-hero { font-size: clamp(2.5rem, 8vw + 1rem, 6rem); line-height: 0.9; letter-spacing: -0.02em; }
.text-headline { font-size: clamp(1.75rem, 5vw + 0.5rem, 3.5rem); line-height: 1.1; }
.text-subheadline { font-size: clamp(1rem, 2vw + 0.5rem, 1.5rem); line-height: 1.5; }
.text-body { font-size: clamp(0.875rem, 1vw + 0.5rem, 1.125rem); line-height: 1.7; }
.text-small { font-size: clamp(0.75rem, 0.5vw + 0.5rem, 0.875rem); }

/* Font Families */
.font-display { font-family: ${fontDisplay}, serif; }
.font-body { font-family: ${fontBody}, sans-serif; }

/* Layout */
.container { width: 100%; max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; }
section { padding: 5rem 0; }
@media (min-width: 768px) { section { padding: 7rem 0; } }

/* Colors */
.bg-primary { background-color: ${colors.primary}; }
.bg-accent { background-color: ${colors.accent}; }
.bg-background { background-color: ${colors.background}; }
.bg-surface { background-color: ${colors.surface}; }
.text-primary { color: ${colors.primary}; }
.text-accent { color: ${colors.accent}; }
.text-muted { color: ${colors.muted}; }

/* Grid */
.grid { display: grid; gap: 2rem; }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
@media (min-width: 768px) {
  .md\\:grid-2 { grid-template-columns: repeat(2, 1fr); }
  .md\\:grid-3 { grid-template-columns: repeat(3, 1fr); }
}

/* Flex */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.gap-4 { gap: 1rem; }
.gap-8 { gap: 2rem; }

/* Spacing */
.mb-4 { margin-bottom: 1rem; }
.mb-8 { margin-bottom: 2rem; }
.mb-12 { margin-bottom: 3rem; }
.mt-4 { margin-top: 1rem; }
.mt-8 { margin-top: 2rem; }

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 1.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}
.btn-primary {
  background-color: ${colors.accent};
  color: white;
}
.btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
.btn-secondary {
  background-color: transparent;
  border: 2px solid ${colors.accent};
  color: ${colors.text};
}
.btn-secondary:hover { background-color: ${colors.accent}10; }

/* Cards */
.card {
  background: ${colors.surface};
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid ${colors.border};
}

/* Hero Section */
.hero {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 0;
}
.hero-content { max-width: 800px; }

/* Projects Grid */
.projects-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
}
@media (min-width: 768px) {
  .projects-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .projects-grid { grid-template-columns: repeat(3, 1fr); }
}

.project-card {
  background: ${colors.surface};
  border-radius: 0.5rem;
  overflow: hidden;
  transition: transform 0.2s ease;
}
.project-card:hover { transform: translateY(-4px); }
.project-card-content { padding: 1.5rem; }
.project-title {
  font-family: ${fontDisplay}, serif;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}
.project-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}
.tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  background: ${colors.background};
  border-radius: 9999px;
  color: ${colors.muted};
}

/* Testimonials */
.testimonials-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
}
@media (min-width: 768px) {
  .testimonials-grid { grid-template-columns: repeat(2, 1fr); }
}
.testimonial-card {
  background: ${colors.surface};
  border-radius: 0.5rem;
  padding: 2rem;
  border: 1px solid ${colors.border};
}
.testimonial-quote {
  font-style: italic;
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
}
.testimonial-author {
  font-weight: 500;
}
.testimonial-role {
  font-size: 0.875rem;
  color: ${colors.muted};
}

/* Contact Section */
.contact-section {
  background: ${colors.surface};
  padding: 5rem 0;
}
.contact-grid {
  display: grid;
  gap: 3rem;
  grid-template-columns: 1fr;
}
@media (min-width: 768px) {
  .contact-grid { grid-template-columns: 1fr 1fr; }
}

/* Navigation */
.navbar {
  padding: 1rem 0;
  border-bottom: 1px solid ${colors.border};
}
.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nav-logo {
  font-family: ${fontDisplay}, serif;
  font-size: 1.25rem;
  font-weight: 500;
}

/* Footer */
.footer {
  padding: 3rem 0;
  border-top: 1px solid ${colors.border};
  text-align: center;
  color: ${colors.muted};
  font-size: 0.875rem;
}

/* Utility */
.text-center { text-align: center; }
.leading-relaxed { line-height: 1.75; }
.tracking-tight { letter-spacing: -0.02em; }
.font-light { font-weight: 300; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }

/* Accent Colors for Projects */
.accent-blue { border-left: 4px solid #3b82f6; }
.accent-green { border-left: 4px solid #10b981; }
.accent-purple { border-left: 4px solid #8b5cf6; }
.accent-orange { border-left: 4px solid #f59e0b; }
.accent-red { border-left: 4px solid #ef4444; }
.accent-teal { border-left: 4px solid #14b8a6; }
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
<nav class="navbar" style="background: ${colors.background}">
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
${options?.isWhiteLabel ? '' : `<footer class="footer" style="background: ${colors.background}">
  <div class="container">
    <p>Made with Platforms</p>
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
  const ctaText = section.cta?.text || 'Get Started';
  const ctaHref = section.cta?.href || '#contact';

  return `
<section class="hero" style="background: ${colors.background}">
  <div class="container">
    <div class="hero-content">
      <h1 class="text-hero font-display" style="color: ${colors.text}; font-family: ${fontDisplay}">${escapeHtml(headline)}</h1>
      ${subheadline ? `<p class="text-subheadline mt-8" style="color: ${colors.muted}">${escapeHtml(subheadline)}</p>` : ''}
      <div class="mt-8">
        <a href="${escapeHtml(ctaHref)}" class="btn btn-primary">${escapeHtml(ctaText)}</a>
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
<div class="grid grid-2 md\\:grid-3 mt-8" style="border-top: 1px solid ${colors.border}; padding-top: 2rem;">
  ${stats.map(stat => `
  <div>
    <span class="text-headline font-display" style="color: ${colors.text}; font-family: ${fontDisplay}">${escapeHtml(stat.value || '')}</span>
    <p style="color: ${colors.muted}; margin-top: 0.5rem;">${escapeHtml(stat.label || '')}</p>
  </div>
  `).join('')}
</div>
`;
    }
  }

  return `
<section style="background: ${colors.background}">
  <div class="container">
    <div class="contact-grid">
      <div>
        <span style="color: ${colors.accent}; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.1em;">About</span>
        <h2 class="text-headline font-display mt-4" style="color: ${colors.text}; font-family: ${fontDisplay}">${escapeHtml(heading)}</h2>
      </div>
      <div>
        <p class="text-body" style="color: ${colors.text}">${escapeHtml(body)}</p>
        ${statsHTML}
      </div>
    </div>
  </div>
</section>
`;
}

function renderProjects(section: Extract<Section, { type: 'projects' }>, colors: any, fontDisplay: string): string {
  const heading = section.heading || 'Our Work';
  const items = section.items || [];

  const accentClasses = ['accent-blue', 'accent-green', 'accent-purple', 'accent-orange', 'accent-red', 'accent-teal'];

  return `
<section style="background: ${colors.surface}">
  <div class="container">
    <h2 class="text-headline font-display text-center mb-12" style="color: ${colors.text}; font-family: ${fontDisplay}">${escapeHtml(heading)}</h2>
    <div class="projects-grid">
      ${items.map((item, i) => `
      <article class="project-card ${accentClasses[i % accentClasses.length]}">
        <div class="project-card-content">
          <h3 class="project-title" style="color: ${colors.text}; font-family: ${fontDisplay}">${escapeHtml(item.title || 'Project')}</h3>
          <p style="color: ${colors.muted}; margin-top: 0.5rem;">${escapeHtml(item.description || '')}</p>
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
  const items = section.items || [];

  return `
<section style="background: ${colors.background}">
  <div class="container">
    <h2 class="text-headline font-display text-center mb-12" style="color: ${colors.text}; font-family: ${fontDisplay}">${escapeHtml(heading)}</h2>
    <div class="testimonials-grid">
      ${items.map(item => `
      <blockquote class="testimonial-card">
        <p class="testimonial-quote" style="color: ${colors.text}">"${escapeHtml(item.quote || '')}"</p>
        <footer>
          <p class="testimonial-author" style="color: ${colors.text}">${escapeHtml(item.name || '')}</p>
          ${item.role ? `<p class="testimonial-role">${escapeHtml(item.role)}${item.company ? `, ${escapeHtml(item.company)}` : ''}</p>` : ''}
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
  const email = section.email || '';

  return `
<section class="contact-section">
  <div class="container">
    <div class="contact-grid">
      <div>
        <h2 class="text-headline font-display" style="color: ${colors.text}; font-family: ${fontDisplay}">${escapeHtml(heading)}</h2>
        ${section.subheading ? `<p class="text-subheadline mt-4" style="color: ${colors.muted}">${escapeHtml(section.subheading)}</p>` : ''}
      </div>
      <div>
        ${email ? `<p class="text-body" style="color: ${colors.text}">Email: <a href="mailto:${escapeHtml(email)}" style="color: ${colors.accent}">${escapeHtml(email)}</a></p>` : ''}
        ${section.phone ? `<p class="text-body mt-4" style="color: ${colors.text}">Phone: ${escapeHtml(section.phone)}</p>` : ''}
        ${section.location ? `<p class="text-body mt-4" style="color: ${colors.muted}">${escapeHtml(section.location)}</p>` : ''}
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
