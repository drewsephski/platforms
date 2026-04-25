import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateObject } from 'ai';
import { SiteContentSchema, type SiteContent } from '@/lib/types/site';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const DESIGN_SYSTEM_PROMPT = `You are an elite creative director, copywriter, and frontend designer. Your job is to create DISTINCTIVE, memorable websites with RICH, BUSINESS-SPECIFIC CONTENT that avoids generic "AI slop" aesthetics and template text.

## CRITICAL CONTENT PRINCIPLES (MOST IMPORTANT)

### 1. GENERATE COMPREHENSIVE, BUSINESS-SPECIFIC CONTENT
- **NEVER use generic placeholders** like "Project title", "About heading", "Contact heading"
- **ALWAYS generate 6-8 detailed projects** tailored to the specific business
- **Create 3-4 detailed testimonials** with realistic names, roles, and specific outcomes
- **Generate detailed about section** with 3-4 paragraphs covering: mission, approach, team/background, unique value proposition
- **Include stats in the about section** with 4-6 relevant business metrics (years, clients, projects, satisfaction rate, etc.)

### 2. TAILOR CONTENT TO THE BUSINESS TYPE
Analyze the user's request deeply:
- If it's a **portfolio**: Generate specific project case studies with technologies used, challenges solved, outcomes achieved
- If it's a **business/service**: Generate detailed service packages, pricing tiers, client testimonials, process overview
- If it's a **product**: Generate feature highlights, use cases, benefits, comparison with alternatives
- If it's a **restaurant/cafe**: Generate menu categories, signature items, atmosphere description, story
- If it's a **consultancy**: Generate service areas, case studies, team expertise, methodology

### 3. WRITE COMPELLING COPY
- **Headlines must be specific and benefit-driven**, not generic
- **Use concrete numbers and specifics** (e.g., "increased conversion by 340%" not "great results")
- **Include social proof** throughout (client names, metrics, testimonials)
- **Write in active voice** with strong verbs
- **Address customer pain points** and how the business solves them
- **Include clear CTAs** that are action-oriented and specific

### 4. CONTENT DENSITY REQUIREMENTS
- Hero: Compelling headline (8-15 words), descriptive subheadline (15-25 words), specific tagline
- About: 3-4 paragraphs (each 3-5 sentences) covering different aspects
- Projects/Services: 6-8 items, each with title (3-7 words), description (2-3 sentences), 3-4 relevant tags
- Testimonials: 3-4 items, each with quote (2-3 sentences), name, role/company, specific outcome
- Services (if applicable): 4-6 items, each with title, description (2-3 sentences), what's included
- Process: 3-4 steps, each with title and description (2-3 sentences)
- FAQ: 4-6 questions with detailed answers (2-4 sentences each)
- Stats: 4-6 metrics with labels and specific values
- Contact: Specific heading, email, social links, location if applicable

## CRITICAL DESIGN PRINCIPLES

### 5. COMMIT TO A BOLD AESTHETIC DIRECTION
Choose ONE of these directions based on the user's content:
- **Brutalist/Raw**: Exposed structure, bold typography, stark contrast, unpolished edges
- **Editorial/Magazine**: Asymmetric layouts, large imagery, sophisticated typography, generous whitespace
- **Retro-Futuristic**: Geometric shapes, gradient accents, space-age curves, neon touches
- **Organic/Natural**: Soft shapes, earthy colors, handwritten touches, flowing layouts
- **Minimal/Refined**: Extreme restraint, precision spacing, single accent color, maximum impact per element
- **Maximalist**: Layered elements, vibrant colors, pattern clashes, energetic composition
- **Art Deco/Geometric**: Symmetrical patterns, metallic accents, bold geometry, luxury feel
- **Industrial/Utilitarian**: Grid systems, monospace accents, functional layouts, raw textures

### 6. TYPOGRAPHY (CRITICAL)
- NEVER use generic fonts like Inter, Roboto, or system defaults
- Choose DISTINCTIVE font pairings: display + body combinations that create personality
- Examples: Playfair Display + Source Sans Pro, Space Grotesk + Inter, Fraunces + Work Sans
- Use fluid type scales with dramatic size contrasts
- Left-align headings, vary weights dramatically (light headlines with bold body, or vice versa)

### 7. COLOR (CRITICAL)
- NEVER use: cyan-on-dark, purple-blue gradients, neon accents on dark, pure black/white
- Create COHESIVE palettes with 1-2 dominant colors + 1 sharp accent
- Tint neutrals toward your brand hue (subtle warm or cool undertones)
- Use oklch() or hsl() color functions conceptually
- Dark mode: deep charcoal (#0a0a0f) not pure black, with warm or cool undertones
- Light mode: off-white (#faf9f7) not pure white, with subtle tints

### 8. LAYOUT & SPACE
- AVOID: Centered everything, card grids with identical items, hero metric templates
- USE: Asymmetric layouts, varied spacing (tight groups + generous separations)
- Break the grid intentionally - overlap elements, use negative space dramatically
- Left-align primary content with strategic right-side accents
- Full-bleed sections with contained content inside

### 9. VISUAL DETAILS
- AVOID: Glassmorphism everywhere, sparklines as decoration, rounded cards with thick borders
- USE: Purposeful decorative elements that reinforce the aesthetic direction
- Consider: Subtle textures, custom cursors, unusual scroll behaviors, distinctive hover states

### 10. MOTION & INTERACTION
- One well-orchestrated entrance animation beats scattered micro-interactions
- Use staggered reveals for content sections
- Exponential easing (ease-out-quart) for natural deceleration
- Purposeful hover states that reveal secondary actions
- Progress indicators that feel considered, not default

## OUTPUT REQUIREMENTS

Generate a SiteContent object with:
1. **Theme**: Choose specific aesthetic direction, colors, and font pairing
2. **Sections**: Each section must feel purposefully designed, not templated
3. **Content**: Every word must earn its place - NO filler text, NO generic placeholders
4. **Layout**: Asymmetric compositions, varied spacing, intentional visual rhythm
5. **Richness**: Include all section types (hero, about, projects, testimonials, contact) with comprehensive content

## THE AI SLOP TEST
If someone would immediately believe "AI made this," you've failed. Create something that makes them ask "How was this made?"

Be BOLD. Be DISTINCTIVE. Be MEMORABLE. Most importantly: Be SPECIFIC to the business.`;

// @ts-ignore - This is a string template for AI prompt, not actual code
const CONTENT_STRUCTURE_EXAMPLE = `
{
  "version": "1.0",
  "meta": { "title": "...", "description": "..." },
  "theme": {
    "preset": "minimal",
    "aesthetic": "AESTHETIC_PLACEHOLDER",
    "background": "light",
    "font": "serif",
    "fontPairing": { "display": "Font Name", "body": "Font Name" },
    "colors": { "primary": "#...", "accent": "#...", "background": "#...", "surface": "#...", "text": "#...", "muted": "#...", "border": "#..." }
  },
  "sections": [
    {
      "type": "hero",
      "id": "hero-1",
      "style": "asymmetric",
      "headline": "Write a SPECIFIC, compelling headline for this business (8-15 words)",
      "subheadline": "Write a descriptive subheadline that explains the value proposition (15-25 words)",
      "tagline": "Optional specific tagline",
      "cta": { "text": "Specific action-oriented CTA text", "href": "#projects", "variant": "primary" },
      "secondaryCta": { "text": "Secondary CTA text", "href": "#contact" },
      "layout": { "textAlign": "left", "decorative": "gradient" }
    },
    {
      "type": "about",
      "id": "about-1",
      "layout": "editorial",
      "heading": "Write a specific about section heading",
      "body": "Write 2-3 concise sentences covering mission and unique value proposition (200-400 characters max). Be specific to this business.",
      "stats": [
        { "label": "Specific metric label", "value": "Specific value with unit" },
        { "label": "Another metric", "value": "Value" },
        { "label": "Third metric", "value": "Value" },
        { "label": "Fourth metric", "value": "Value" }
      ]
    },
    {
      "type": "projects",
      "id": "projects-1",
      "layout": "featured",
      "heading": "Projects/Work heading",
      "subheading": "Brief description of work shown",
      "items": [
        { "id": "p1", "title": "Specific project title", "description": "2-3 sentence description with specific outcomes, technologies used, challenges solved", "href": "#", "tags": ["Tag1", "Tag2", "Tag3"], "size": "large", "accentColor": "#..." },
        { "id": "p2", "title": "Another project", "description": "Description with specifics", "href": "#", "tags": ["Tag1", "Tag2"], "accentColor": "#..." },
        { "id": "p3", "title": "Third project", "description": "Description with specifics", "href": "#", "tags": ["Tag1", "Tag2", "Tag3"], "accentColor": "#..." },
        { "id": "p4", "title": "Fourth project", "description": "Description with specifics", "href": "#", "tags": ["Tag1", "Tag2"], "accentColor": "#..." },
        { "id": "p5", "title": "Fifth project", "description": "Description with specifics", "href": "#", "tags": ["Tag1", "Tag2", "Tag3"], "accentColor": "#..." },
        { "id": "p6", "title": "Sixth project", "description": "Description with specifics", "href": "#", "tags": ["Tag1", "Tag2"], "accentColor": "#..." }
      ]
    },
    {
      "type": "testimonials",
      "id": "testimonials-1",
      "layout": "masonry",
      "heading": "Testimonials heading",
      "items": [
        { "id": "t1", "quote": "Specific testimonial quote with concrete results (2-3 sentences)", "name": "Realistic person name", "role": "Specific role", "company": "Company name", "outcome": "Specific outcome achieved" },
        { "id": "t2", "quote": "Another testimonial with specifics", "name": "Name", "role": "Role", "company": "Company", "outcome": "Outcome" },
        { "id": "t3", "quote": "Third testimonial with specifics", "name": "Name", "role": "Role", "company": "Company", "outcome": "Outcome" }
      ]
    },
    {
      "type": "contact",
      "id": "contact-1",
      "layout": "fullbleed",
      "heading": "Specific contact section heading",
      "subheading": "Brief description of how to get in touch",
      "email": "specific@email.com",
      "phone": "+1-555-123-4567",
      "location": "Specific location if applicable",
      "links": [
        { "label": "Twitter", "href": "https://twitter.com" },
        { "label": "LinkedIn", "href": "https://linkedin.com" },
        { "label": "GitHub", "href": "https://github.com" },
        { "label": "Instagram", "href": "https://instagram.com" }
      ]
    }
  ]
}`;

export async function generateSiteContent(
  prompt: string,
  template: string = 'dev',
  aesthetic: string = 'editorial'
): Promise<SiteContent> {
  const structureExample = CONTENT_STRUCTURE_EXAMPLE.replace('AESTHETIC_PLACEHOLDER', aesthetic);

  const result = await generateObject({
    model: openrouter('google/gemini-3.1-flash-lite-preview'),
    schema: SiteContentSchema,
    prompt: `${DESIGN_SYSTEM_PROMPT}

User's request: ${prompt}

Template reference (use for structure only, make it DISTINCTIVE): ${template}

VISUAL AESTHETIC TO USE: ${aesthetic}
- Choose fonts, colors, and layouts that match this aesthetic direction
- Editorial: Playfair Display + clean sans, warm neutrals, asymmetric layouts
- Minimal: System fonts, extreme whitespace, single accent color
- Brutalist: Bold monospace, stark contrast, exposed grid
- Retro-Futuristic: Geometric sans, gradient accents, space-age curves
- Organic: Soft rounded fonts, earthy palette, flowing asymmetry
- Maximalist: Layered elements, vibrant clashing colors, energetic
- Art Deco: Symmetrical, metallic accents, bold geometry
- Industrial: Monospace, utilitarian grays, functional grids

Generate a complete SiteContent object. Follow this EXACT structure:

${structureExample}

CRITICAL - MOST COMMON MISTAKES:
- WRONG: Using generic placeholders like "Project title", "About heading", "Contact heading" - NEVER DO THIS
- WRONG: Creating a separate section with type "headline" - NEVER DO THIS
- WRONG: Only generating 3 projects - MUST generate 6-8
- WRONG: Skipping testimonials section - MUST include it
- WRONG: Generating multiple hero sections - MUST generate exactly ONE hero section
- CORRECT: Put "headline", "subheadline", "tagline", "cta" fields DIRECTLY inside the hero object
- CORRECT: Write SPECIFIC, business-tailored content for EVERY field
- CORRECT: Include all section types: hero (exactly ONE), about, projects, testimonials, contact
- CORRECT: Add stats array to the about section with 4-6 metrics

REQUIRED FIELDS:
- hero: type, id, style, headline (string), subheadline (string) - EXACTLY ONE HERO SECTION
- about: type, id, heading (string), body (string), stats (array with 4-6 metrics)
- projects: type, id, heading (string), items (array with 6-8 objects)
- testimonials: type, id, heading (string), items (array with 3-4 objects)
- contact: type, id, heading (string), email (string)

Style options: centered, split, minimal, asymmetric, fullbleed, grid, masonry

Now generate content for this request. Remember: Be SPECIFIC to the business. No generic placeholders.`,
  });

  const content = result.object as SiteContent;

  // Defensive: Ensure only one hero section exists at the top
  const heroSections = content.sections.filter(s => s.type === 'hero');
  if (heroSections.length > 1) {
    // Find the hero with actual content (not placeholder "Welcome")
    const heroToKeep = heroSections.find(h => h.headline && h.headline !== 'Welcome' && h.headline.length > 10) || heroSections[0];
    // Remove all hero sections and insert the kept one at the beginning
    content.sections = content.sections.filter(s => s.type !== 'hero');
    content.sections.unshift(heroToKeep);
  } else if (heroSections.length === 1) {
    // Ensure the single hero is at the top
    const heroIndex = content.sections.findIndex(s => s.type === 'hero');
    if (heroIndex !== 0) {
      const [hero] = content.sections.splice(heroIndex, 1);
      content.sections.unshift(hero);
    }
  }

  return content;
}
