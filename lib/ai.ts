import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateObject } from 'ai';
import { SiteContentSchema, type SiteContent } from '@/lib/types/site';
import { readFileSync } from 'fs';
import { join } from 'path';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const DESIGN_SYSTEM_PROMPT = `You are an elite creative director, copywriter, and frontend designer. Your job is to create DISTINCTIVE, memorable websites with RICH, BUSINESS-SPECIFIC CONTENT that avoids generic "AI slop" aesthetics and template text.

## CRITICAL: NO IMAGES POLICY

**DO NOT generate or reference images** - All imageUrl and avatarUrl fields will be blank placeholders. Instead, create visually compelling designs using:
- Bold typography as the primary visual element
- Creative use of color blocks, gradients, and shapes
- Distinctive layouts that don't rely on imagery
- Decorative geometric elements, patterns, and textures
- Dramatic whitespace and intentional negative space

The design should be stunning WITHOUT any images. Think Swiss design, brutalist typography, or editorial layouts where type and space create the visual impact.

## CRITICAL CONTENT PRINCIPLES (MOST IMPORTANT)

### 1. GENERATE COMPREHENSIVE, BUSINESS-SPECIFIC CONTENT
- **NEVER use generic placeholders** like "Project title", "About heading", "Contact heading", "Welcome to our website"
- **ALWAYS generate 6-8 detailed projects** tailored to the specific business with SPECIFIC names and outcomes
- **Create 3-4 detailed testimonials** with realistic full names, specific roles, companies, and concrete results
- **Generate detailed about section** with 3-4 paragraphs covering: origin story, mission, approach, team/background, unique value proposition
- **Include stats in the about section** with 4-6 relevant business metrics (years, clients, projects, satisfaction rate, revenue growth, etc.)

### 2. TAILOR CONTENT TO THE BUSINESS TYPE
Analyze the user's request deeply and generate SPECIFIC content:
- If it's a **portfolio**: Generate real project names, specific technologies used, measurable challenges solved ("reduced load time by 60%"), outcomes achieved
- If it's a **business/service**: Generate specific service packages with actual pricing tiers, detailed process steps, client testimonials with company names
- If it's a **product**: Generate specific feature names, real use cases, quantified benefits, competitive advantages
- If it's a **restaurant/cafe**: Generate actual menu categories, signature dish names, specific atmosphere descriptions, chef/owner story
- If it's a **consultancy**: Generate named service areas, specific case studies with metrics, team expertise areas, methodology names
- If it's a **SaaS**: Generate feature names, integration details, pricing tiers, specific problem statements and solutions

### 3. WRITE TIGHT, COMPELLING COPY
- **Headlines must be specific and benefit-driven** - NO generic phrases like "Welcome to my site" or "We deliver excellence"
- **Front-load the value** - Lead with the most important information in every section
- **Use concrete numbers and specifics** (e.g., "increased conversion by 340%" not "great results", "serves 500+ daily customers" not "popular restaurant")
- **Include social proof** throughout (specific client names like "Sarah Chen, CTO at TechFlow", metrics, detailed testimonials)
- **Write in active voice** with strong, specific verbs (not "we are dedicated to" but "we build", "we design", "we solve")
- **Address specific customer pain points** and how the business uniquely solves them
- **Include clear, action-oriented CTAs** that are specific ("Book a free strategy call" not "Contact us")
- **Eliminate fluff** - Every word must earn its place. Cut "we believe", "our mission is", "committed to excellence"

### 4. CONTENT DENSITY & SPECIFICITY REQUIREMENTS
- Hero: Compelling headline (6-12 words that communicate value), descriptive subheadline (15-25 words with specific benefit), memorable tagline
- About: **MAXIMUM 500 CHARACTERS TOTAL** - 2-3 concise sentences covering origin, mission, and unique value. Example: "Founded in 2012, we've helped 200+ brands transform their digital presence. Our data-driven approach combines strategy with creativity to deliver measurable results. We specialize in e-commerce optimization and brand identity systems." (This is 247 characters - well under the limit).
- Projects/Services: 6-8 items minimum, each with:
  - Title: 3-7 words, specific and descriptive (not "Project 1")
  - Description: 2-3 sentences with specific outcomes, technologies, challenges
  - 3-4 relevant, specific tags (not generic "Design", "Development")
  - Distinctive accentColor for each project
- Testimonials: 3-4 items, each with:
  - Quote: 2-3 sentences with specific praise and concrete results
  - Full name (not "John D."), specific role, actual company name
  - Specific outcome achieved ("increased our conversion rate by 45%")
- Services (if applicable): 4-6 items, each with title, description (2-3 sentences), what's specifically included
- Process: 3-4 steps, each with action-oriented title and description (2-3 sentences)
- FAQ: 4-6 questions with detailed answers (2-4 sentences each), addressing real objections
- Stats: 4-6 metrics with specific labels and realistic values
- Contact: Specific, benefit-driven heading (not "Contact Us"), specific email, relevant social links

### 4.5 CRITICAL: DISTRIBUTE CONTENT EVENLY
- **Do NOT stuff all content into the about section** - The about section has a strict 500 character limit
- Distribute rich, specific content across ALL sections: projects, testimonials, services, process, FAQ
- Each section should have substantial, specific content - not just the about section
- Projects should carry most of the detailed information (6-8 items with specific outcomes)
- Testimonials should provide social proof with concrete results
- About section should be a concise summary, not a content dump
- **EVERY section must have specific, non-placeholder content** - No section should be empty or generic

## CRITICAL RESPONSIVE DESIGN PRINCIPLES

### 5. MOBILE-FIRST HIERARCHY
- **Typography scales dramatically**: Hero headlines should be text-5xl on mobile, md:text-7xl, lg:text-8xl
- **Touch-friendly targets**: All interactive elements must be at least 44px tall
- **Readable text**: Minimum 16px body text, comfortable line-height (leading-relaxed)
- **Single-column layouts on mobile**, expanding to multi-column on larger screens
- **Stack navigation elements vertically** on mobile, horizontal on desktop
- **Full-width sections with contained content** - container mx-auto with px-6 padding

### 6. VISUAL HIERARCHY & READABILITY
- **Create clear focal points** - One dominant element per section
- **Use dramatic size contrasts** - Headlines 3-4x larger than body text
- **Establish reading order** with strategic spacing and alignment
- **Limit line length** - Max 65 characters per line for optimal readability
- **Use whitespace intentionally** - Tight groupings with generous separations
- **Color contrast** - Ensure 4.5:1 minimum contrast ratio for accessibility

## CRITICAL DESIGN PRINCIPLES

### 7. COMMIT TO A BOLD AESTHETIC DIRECTION
Choose ONE of these directions based on the user's content:
- **Brutalist/Raw**: Exposed structure, bold typography, stark contrast, monospace accents, NO images needed
- **Editorial/Magazine**: Asymmetric layouts, sophisticated typography, generous whitespace, type as image
- **Retro-Futuristic**: Geometric shapes, gradient accents, space-age curves, neon touches, bold geometry
- **Organic/Natural**: Soft shapes, earthy colors, flowing layouts, handwritten-style typography
- **Minimal/Refined**: Extreme restraint, precision spacing, single accent color, maximum impact per element
- **Maximalist**: Layered typography, vibrant colors, energetic composition (still NO images - use color/type)
- **Art Deco/Geometric**: Symmetrical patterns, bold geometry, luxury feel through structure
- **Industrial/Utilitarian**: Grid systems, monospace accents, functional layouts, raw textures

### 8. TYPOGRAPHY AS THE PRIMARY VISUAL (CRITICAL)
- NEVER use generic fonts like Inter, Roboto, or system defaults
- Choose DISTINCTIVE font pairings: display + body combinations that create personality
- **Use typography as imagery** - Oversized headlines, creative text layouts, type as decoration
- Examples: Playfair Display + Source Sans Pro, Space Grotesk + Inter, Fraunces + Work Sans, Cormorant + Open Sans
- Use fluid type scales with dramatic size contrasts (4:1 ratio minimum)
- Left-align primary content, use varied weights dramatically
- **Large display text can be the visual focal point** - no images needed

### 9. COLOR (CRITICAL)
- NEVER use: cyan-on-dark, purple-blue gradients, neon accents on dark, pure black/white
- Create COHESIVE palettes with 1-2 dominant colors + 1 sharp accent
- Use color blocks, gradients, and shapes instead of images
- Tint neutrals toward your brand hue (subtle warm or cool undertones)
- Dark mode: deep charcoal (#0a0a0f) not pure black, with warm or cool undertones
- Light mode: off-white (#faf9f7) not pure white, with subtle tints
- Each project should have a distinctive accentColor for visual variety

### 10. LAYOUT & SPACE (RESPONSIVE)
- AVOID: Centered everything, card grids with identical items, hero metric templates
- USE: Asymmetric layouts, varied spacing (tight groups + generous separations)
- Break the grid intentionally - overlap elements, use negative space dramatically
- **Grid systems**: lg:grid-cols-12 for flexible asymmetric layouts
- **Consistent spacing scale**: py-24 lg:py-32 for section padding
- Left-align primary content with strategic right-side accents
- Full-bleed sections with contained content inside

### 11. VISUAL DETAILS (NO-IMAGE ALTERNATIVES)
- AVOID: Glassmorphism everywhere, sparklines as decoration, relying on images
- USE: Purposeful decorative elements that reinforce the aesthetic direction
- **Color blocks and shapes** as visual elements instead of images
- **Geometric patterns**, custom borders, distinctive dividers
- **Gradient accents**, subtle textures, distinctive hover states
- **Large typographic elements** as visual anchors

### 12. MOTION & INTERACTION
- One well-orchestrated entrance animation beats scattered micro-interactions
- Use staggered reveals for content sections
- Exponential easing (ease-out-quart) for natural deceleration
- Purposeful hover states that reveal secondary actions
- **Respect prefers-reduced-motion** - animations should enhance, not be required

## OUTPUT REQUIREMENTS

Generate a SiteContent object with:
1. **Theme**: Choose specific aesthetic direction, cohesive colors, and distinctive font pairing
2. **Sections**: Each section must feel purposefully designed, not templated - use asymmetric layouts
3. **Content**: Every word must earn its place - NO filler text, NO generic placeholders, NO image dependencies
4. **Layout**: Asymmetric compositions, varied spacing, intentional visual rhythm, fully responsive
5. **Richness**: Include all section types (hero, about, projects, testimonials, contact) with comprehensive, specific content
6. **NO IMAGES**: Design must be stunning without any imageUrl or avatarUrl references

## THE AI SLOP TEST
If someone would immediately believe "AI made this," you've failed. Create something that makes them ask "How was this made?"

Be BOLD. Be DISTINCTIVE. Be MEMORABLE. Be SPECIFIC. Be RESPONSIVE. Most importantly: Be SPECIFIC to the business and design for NO IMAGES.`;

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
    "fontPairing": { "display": "Playfair Display", "body": "Source Sans 3" },
    "colors": { "primary": "#1a1a1a", "accent": "#c9a227", "background": "#faf9f7", "surface": "#f5f4f2", "text": "#1a1a1a", "muted": "#6b6b6b", "border": "#e5e5e5" }
  },
  "sections": [
    {
      "type": "hero",
      "id": "hero-1",
      "style": "asymmetric",
      "headline": "Specific benefit-driven headline (6-12 words, NO generic phrases like 'Welcome to our site')",
      "subheadline": "Specific value proposition with concrete details (15-25 words). Include numbers/metrics if relevant.",
      "tagline": "Memorable, specific tagline that differentiates the business",
      "cta": { "text": "Specific action verb + benefit (e.g., 'Book free consultation', 'Start your project')", "href": "#projects", "variant": "primary" },
      "secondaryCta": { "text": "Secondary action with clear purpose", "href": "#contact" },
      "layout": { "textAlign": "left", "decorative": "gradient" }
    },
    {
      "type": "about",
      "id": "about-1",
      "layout": "editorial",
      "heading": "Specific, benefit-driven heading (not 'About Us')",
      "body": "1-3 consice paragraphs. Paragraph 1: Origin story with specific details. Paragraph 2: Mission and approach. Paragraph 3: What makes you different. Paragraph 4: Results/impact.",
      "stats": [
        { "label": "Specific metric (e.g., 'Client retention rate')", "value": "Specific value with % or number (e.g., '94%')" },
        { "label": "Years in business", "value": "12+ years" },
        { "label": "Projects completed", "value": "500+" },
        { "label": "Specific outcome metric", "value": "$2M+ revenue generated for clients" },
        { "label": "Team size or expertise", "value": "15 specialists" },
        { "label": "Recognition/awards", "value": "3 industry awards" }
      ]
    },
    {
      "type": "projects",
      "id": "projects-1",
      "layout": "featured",
      "heading": "Specific work heading (not generic 'Our Work')",
      "subheading": "Brief, specific description of what the work represents",
      "items": [
        { "id": "p1", "title": "Specific project name with outcome (e.g., 'E-commerce redesign: 40% conversion lift')", "description": "2-3 sentences with SPECIFIC outcomes: What was the challenge? What technologies/strategy? What measurable result? Include numbers like 'reduced load time by 60%', 'increased engagement by 3x'", "href": "#", "tags": ["Specific tech", "Specific service", "Specific outcome"], "size": "large", "accentColor": "#1e3a5f" },
        { "id": "p2", "title": "Another specific project name", "description": "Description with specific challenge, approach, and quantified outcome", "href": "#", "tags": ["Tag1", "Tag2", "Tag3"], "accentColor": "#8b4513" },
        { "id": "p3", "title": "Third project - specific and descriptive", "description": "Specific description with metrics", "href": "#", "tags": ["Tag1", "Tag2"], "accentColor": "#2d2d2d" },
        { "id": "p4", "title": "Fourth project name", "description": "Description with specific outcomes", "href": "#", "tags": ["Tag1", "Tag2", "Tag3"], "accentColor": "#5c3a21" },
        { "id": "p5", "title": "Fifth project name", "description": "Description with specific metrics", "href": "#", "tags": ["Tag1", "Tag2"], "accentColor": "#1a472a" },
        { "id": "p6", "title": "Sixth project name", "description": "Description with specific results", "href": "#", "tags": ["Tag1", "Tag2", "Tag3"], "accentColor": "#4a1c6b" },
        { "id": "p7", "title": "Seventh project - add if relevant", "description": "Description with specifics", "href": "#", "tags": ["Tag1", "Tag2"], "accentColor": "#0f4c75" },
        { "id": "p8", "title": "Eighth project - add if relevant", "description": "Description with specifics", "href": "#", "tags": ["Tag1", "Tag2", "Tag3"], "accentColor": "#7c3c3c" }
      ]
    },
    {
      "type": "testimonials",
      "id": "testimonials-1",
      "layout": "masonry",
      "heading": "Specific heading about results/client love",
      "items": [
        { "id": "t1", "quote": "Specific praise with concrete results. Not 'great to work with' but 'Their redesign increased our conversion rate by 45% in the first month. The systematic approach and weekly check-ins kept everything on track.'", "name": "Full realistic name (e.g., 'Sarah Chen')", "role": "Specific title", "company": "Actual company name", "outcome": "Specific quantified result (e.g., '45% increase in conversions')" },
        { "id": "t2", "quote": "Another specific testimonial with concrete details about what was delivered and the specific impact", "name": "Full realistic name", "role": "Specific role", "company": "Company name", "outcome": "Specific outcome achieved" },
        { "id": "t3", "quote": "Third testimonial with specific praise and quantified results", "name": "Full realistic name", "role": "Specific role", "company": "Company name", "outcome": "Specific outcome" },
        { "id": "t4", "quote": "Fourth testimonial with specific details and outcomes", "name": "Full realistic name", "role": "Specific role", "company": "Company name", "outcome": "Specific outcome" }
      ]
    },
    {
      "type": "contact",
      "id": "contact-1",
      "layout": "fullbleed",
      "heading": "Specific benefit-driven CTA (e.g., 'Let's build something remarkable together', not 'Contact Us')",
      "subheading": "Brief description of what happens when they reach out",
      "email": "specific@businessname.com",
      "phone": "Include if relevant for the business",
      "location": "Specific city/region if applicable",
      "links": [
        { "label": "Platform relevant to business", "href": "https://twitter.com" },
        { "label": "LinkedIn", "href": "https://linkedin.com" },
        { "label": "GitHub/Portfolio", "href": "https://github.com" },
        { "label": "Instagram/Dribbble", "href": "https://instagram.com" }
      ]
    }
  ]
}`;

// Helper function to load template file
function loadTemplate(templateName: string): SiteContent | null {
  try {
    const templatePath = join(process.cwd(), 'templates', `${templateName}.json`);
    const templateContent = readFileSync(templatePath, 'utf-8');
    return JSON.parse(templateContent) as SiteContent;
  } catch (error) {
    console.error(`Failed to load template ${templateName}:`, error);
    return null;
  }
}

export async function generateSiteContent(
  prompt: string,
  template: string = 'dev',
  aesthetic: string = 'editorial'
): Promise<SiteContent> {
  // Load template to get theme/aesthetic configuration
  const loadedTemplate = loadTemplate(template);
  
  // Use template's theme if available, otherwise use aesthetic parameter
  const themeToUse = loadedTemplate?.theme || {
    preset: 'default',
    aesthetic: aesthetic as any,
    background: 'light',
    font: 'system',
    colors: {
      primary: '#1a1a1a',
      accent: '#c9a227',
      background: '#faf9f7',
      surface: '#f5f4f2',
      text: '#1a1a1a',
      muted: '#6b6b6b',
      border: '#e5e5e5'
    }
  };

  const structureExample = CONTENT_STRUCTURE_EXAMPLE.replace('AESTHETIC_PLACEHOLDER', aesthetic);

  try {
    const result = await generateObject({
      model: openrouter('google/gemini-3.1-flash-lite-preview'),
      schema: SiteContentSchema,
      prompt: `${DESIGN_SYSTEM_PROMPT}

User's request: ${prompt}

TEMPLATE THEME TO USE (use these exact fonts, colors, and aesthetic direction):
${JSON.stringify(themeToUse, null, 2)}

CRITICAL: You MUST use the theme configuration above for fonts, colors, and aesthetic. Do not choose your own - use exactly what's provided.

Generate content that is SPECIFIC to the user's request above. The content must match their business, role, or project - not generic placeholders.

Generate a complete SiteContent object. Follow this EXACT structure:

${structureExample}

CRITICAL - MOST COMMON MISTAKES TO AVOID:
- WRONG: Using generic placeholders like "Project title", "About heading", "Contact heading", "Welcome to our site" - NEVER DO THIS
- WRONG: Creating a separate section with type "headline" - NEVER DO THIS
- WRONG: Only generating 3 projects - MUST generate 6-8 minimum
- WRONG: Skipping testimonials section - MUST include it with 3-4 detailed testimonials
- WRONG: Generating multiple hero sections - MUST generate exactly ONE hero section
- WRONG: Using imageUrl or avatarUrl fields - NEVER include these, design without images
- WRONG: Generic copy like "We deliver excellence" or "Our mission is to" - NEVER DO THIS
- WRONG: Testimonials with fake names like "John D." or "Jane Smith" - use realistic full names
- WRONG: Projects without specific outcomes/metrics - every project needs quantified results
- WRONG: Stats like "100% satisfaction" - use realistic, specific metrics
- **WRONG: About section body over 500 characters - STRICT LIMIT, will cause validation error**
- **WRONG: Stuffing all content into about section - distribute evenly across all sections**
- **WRONG: Project descriptions like "A great project" or "This was fun" - MUST be specific with outcomes**
- **WRONG: Testimonial quotes like "Great work!" or "Amazing!" - MUST be specific with concrete results**
- **WRONG: Contact heading "Contact Us" - MUST be benefit-driven like "Let's build something remarkable"**
- **WRONG: Empty or generic sections - EVERY section must have substantial, specific content**
- CORRECT: Put "headline", "subheadline", "tagline", "cta" fields DIRECTLY inside the hero object
- CORRECT: Write SPECIFIC, business-tailored content for EVERY field
- CORRECT: Include all section types: hero (exactly ONE), about, projects, testimonials, contact
- CORRECT: Add stats array to the about section with 4-6 specific, realistic metrics
- CORRECT: Design for NO IMAGES - use typography, color, and layout as visual elements
- CORRECT: Use asymmetric layouts (style: asymmetric, layout: editorial) for visual interest
- CORRECT: Each project gets a distinctive accentColor for visual variety without images
- CORRECT: Responsive design - text scales from text-5xl (mobile) to lg:text-8xl (desktop)
- **CORRECT: About body MAXIMUM 500 characters - be extremely concise, distribute details to projects/testimonials**
- **CORRECT: Every section has specific, non-placeholder content - projects with outcomes, testimonials with results**

REQUIRED FIELDS:
- hero: type, id, style, headline (specific 6-12 words), subheadline (specific 15-25 words) - EXACTLY ONE
- about: type, id, heading (specific, not generic), body (**MAXIMUM 500 CHARACTERS** - 2-3 concise paragraphs)
- projects: type, id, heading (specific), items (6-8 objects with specific titles, descriptions, outcomes, tags, accentColor)
- testimonials: type, id, heading (specific), items (3-4 objects with full names, specific quotes, quantified outcomes)
- contact: type, id, heading (benefit-driven), email (specific business email)

RESPONSIVE LAYOUT OPTIONS:
- Hero styles: asymmetric (recommended - breaks grid), centered, split, minimal, fullbleed
- About layouts: editorial (recommended - magazine-style), split, standard, minimal
- Project layouts: featured (recommended - first item large), grid, list, masonry
- Testimonial layouts: masonry (recommended), grid, carousel
- Contact layouts: fullbleed (recommended - dramatic), split, card, simple

TYPOGRAPHY SCALE (use in your content thinking):
- Hero headlines: text-5xl md:text-7xl lg:text-8xl
- Section headings: text-4xl md:text-5xl
- Body text: text-lg leading-relaxed
- Stats/numbers: text-3xl md:text-4xl

AESTHETIC-SPECIFIC GUIDANCE:
- Editorial: Use Playfair Display + clean sans, warm neutrals, asymmetric 12-column layouts
- Minimal: System fonts, extreme whitespace, single accent, generous py-32 spacing
- Brutalist: Bold monospace, stark contrast (#000 on #fff or vice versa), exposed grid, no decoration
- Retro-Futuristic: Geometric sans (Space Grotesk), gradient accents, space-age curves
- Organic: Soft rounded fonts, earthy palette (#5c4a3a, #8b7355), flowing asymmetry
- Maximalist: Layered elements, vibrant clashing colors, energetic - but still NO images
- Art Deco: Symmetrical patterns, metallic accents (#c9a227, #silver), bold geometry
- Industrial: Monospace, utilitarian grays (#4a4a4a), functional grids

Now generate content for this request. Remember: Be SPECIFIC, NO IMAGES, responsive design, tight compelling copy, and asymmetric layouts.`,
    });

    const content = result.object as SiteContent;

    // Safety net: Truncate about section body if it exceeds 500 characters
    const aboutSection = content.sections.find(s => s.type === 'about');
    if (aboutSection && 'body' in aboutSection && aboutSection.body && aboutSection.body.length > 500) {
      console.warn(`About section body exceeds 500 characters (${aboutSection.body.length}), truncating...`);
      aboutSection.body = aboutSection.body.substring(0, 497) + '...';
    }

    // Override the theme with the template's theme to ensure aesthetic consistency
    content.theme = themeToUse;

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
  } catch (error: any) {
    console.error('Schema validation failed, attempting fallback parsing:', error.message);

    // Fallback: Use generateText and manually parse with lenient validation
    const { generateText } = await import('ai');

    const result = await generateText({
      model: openrouter('google/gemini-3.1-flash-lite-preview'),
      prompt: `${DESIGN_SYSTEM_PROMPT}

User's request: ${prompt}

TEMPLATE THEME TO USE (use these exact fonts, colors, and aesthetic direction):
${JSON.stringify(themeToUse, null, 2)}

CRITICAL: You MUST use the theme configuration above for fonts, colors, and aesthetic. Do not choose your own - use exactly what's provided.

Generate content that is SPECIFIC to the user's request above. The content must match their business, role, or project - not generic placeholders.

Generate a complete SiteContent object as JSON. Follow this EXACT structure:

${structureExample}

CRITICAL RULES:
1. Return ONLY valid JSON, no markdown formatting, no code blocks
2. NO imageUrl or avatarUrl fields - design works without images
3. Be SPECIFIC - no generic placeholders like "Project title" or "About Us"
4. Generate 6-8 projects with specific outcomes and metrics
5. Generate 3-4 testimonials with full realistic names and quantified results
6. Use asymmetric layouts (style: asymmetric, layout: editorial)
7. Responsive design: text scales from text-5xl (mobile) to lg:text-8xl (desktop)`,
    });

    // Parse the JSON response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }

    const parsedContent = JSON.parse(jsonMatch[0]);

    // Lenient validation - coerce to schema
    const content = SiteContentSchema.parse(parsedContent) as SiteContent;

    // Safety net: Truncate about section body to 500 characters
    const aboutSection = content.sections.find(s => s.type === 'about');
    if (aboutSection && 'body' in aboutSection && aboutSection.body && aboutSection.body.length > 500) {
      console.warn(`About section body exceeds 500 characters (${aboutSection.body.length}), truncating...`);
      (aboutSection as any).body = aboutSection.body.substring(0, 497) + '...';
    }

    // Override the theme with the template's theme to ensure aesthetic consistency
    content.theme = themeToUse;

    // Defensive: Ensure only one hero section exists at the top
    const heroSections = content.sections.filter(s => s.type === 'hero');
    if (heroSections.length > 1) {
      const heroToKeep = heroSections.find(h => h.headline && h.headline !== 'Welcome' && h.headline.length > 10) || heroSections[0];
      content.sections = content.sections.filter(s => s.type !== 'hero');
      content.sections.unshift(heroToKeep);
    } else if (heroSections.length === 1) {
      const heroIndex = content.sections.findIndex(s => s.type === 'hero');
      if (heroIndex !== 0) {
        const [hero] = content.sections.splice(heroIndex, 1);
        content.sections.unshift(hero);
      }
    }

    return content;
  }
}
