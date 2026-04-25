import { z } from 'zod';

export type AestheticDirection =
  | 'brutalist'
  | 'editorial'
  | 'retro-futuristic'
  | 'organic'
  | 'minimal'
  | 'maximalist'
  | 'art-deco'
  | 'industrial';

export type FontPairing = {
  display: string;
  body: string;
  weights?: {
    display?: number | [number, number];
    body?: number | [number, number];
  };
};

export type ColorPalette = {
  primary: string;
  secondary?: string;
  accent: string;
  background: string;
  surface?: string;
  text: string;
  muted?: string;
  border?: string;
};

export type Theme = {
  preset: 'default' | 'bold' | 'minimal' | 'pastel';
  aesthetic?: AestheticDirection;
  accentColor?: string;
  background?: 'light' | 'dark';
  font?: 'system' | 'serif' | 'mono';
  fontPairing?: FontPairing;
  colors?: ColorPalette;
};

export type HeroSection = {
  type: 'hero';
  id: string;
  headline: string;
  subheadline?: string;
  tagline?: string;
  cta?: { text: string; href: string; variant?: 'primary' | 'secondary' | 'ghost' };
  secondaryCta?: { text: string; href: string };
  style: 'centered' | 'split' | 'minimal' | 'asymmetric' | 'fullbleed';
  layout?: {
    textAlign?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'center' | 'bottom';
    decorative?: 'none' | 'shapes' | 'lines' | 'texture' | 'gradient';
  };
};

export type AboutSection = {
  type: 'about';
  id: string;
  heading: string;
  body: string;
  avatarUrl?: string;
  layout?: 'standard' | 'split' | 'editorial' | 'minimal';
  stats?: { label: string; value: string }[];
};

export type ProjectItem = {
  id: string;
  title: string;
  description: string;
  href?: string;
  tags?: string[];
  imageUrl?: string;
  accentColor?: string;
  size?: 'small' | 'medium' | 'large';
};

export type ProjectsSection = {
  type: 'projects';
  id: string;
  heading: string;
  subheading?: string;
  items: ProjectItem[];
  layout?: 'grid' | 'list' | 'masonry' | 'featured';
  columns?: 1 | 2 | 3;
};

export type TestimonialsSection = {
  type: 'testimonials';
  id: string;
  heading?: string;
  items: {
    id: string;
    quote: string;
    name: string;
    role?: string;
    company?: string;
    outcome?: string;
  }[];
  layout?: 'grid' | 'masonry' | 'carousel';
};

export type ContactSection = {
  type: 'contact';
  id: string;
  heading: string;
  subheading?: string;
  email?: string;
  phone?: string;
  location?: string;
  links?: { label: string; href: string; icon?: string }[];
  layout?: 'simple' | 'split' | 'card' | 'fullbleed';
  cta?: { text: string; href: string };
};

export type StatsSection = {
  type: 'stats';
  id: string;
  heading?: string;
  items: {
    label: string;
    value: string;
  }[];
  layout?: 'minimal' | 'grid' | 'featured';
};

export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  features?: string[];
  price?: string;
};

export type ServicesSection = {
  type: 'services';
  id: string;
  heading: string;
  subheading?: string;
  items: ServiceItem[];
  layout?: 'grid' | 'list' | 'cards';
};

export type ProcessStep = {
  id: string;
  title: string;
  description: string;
};

export type ProcessSection = {
  type: 'process';
  id: string;
  heading: string;
  items: ProcessStep[];
  layout?: 'timeline' | 'steps' | 'numbered';
};

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

export type FAQSection = {
  type: 'faq';
  id: string;
  heading?: string;
  items: FAQItem[];
  layout?: 'accordion' | 'list';
};

export type RawSection = {
  type: 'raw';
  id: string;
  label?: string;
  content: any;
};

export type Section =
  | HeroSection
  | AboutSection
  | ProjectsSection
  | TestimonialsSection
  | ContactSection
  | RawSection;

export type SiteContent = {
  version: '1.0';
  sections: Section[];
  theme: Theme;
  meta: {
    title: string;
    description: string;
    ogImage?: string;
  };
  extras?: Record<string, any>;
};

// Zod schemas for validation
export const FontPairingSchema = z.object({
  display: z.string(),
  body: z.string(),
  weights: z.object({
    display: z.union([z.number(), z.tuple([z.number(), z.number()])]).optional(),
    body: z.union([z.number(), z.tuple([z.number(), z.number()])]).optional(),
  }).optional(),
});

export const ColorPaletteSchema = z.object({
  primary: z.string(),
  secondary: z.string().optional(),
  accent: z.string(),
  background: z.string(),
  surface: z.string().optional(),
  text: z.string(),
  muted: z.string().optional(),
  border: z.string().optional(),
});

// Helper to make enum fields more permissive for AI generation
const permissiveEnum = <T extends readonly [string, ...string[]]>(
  values: T,
  defaultValue: T[number]
) =>
  z.enum(values).catch(defaultValue);

// Helper to normalize optional strings (empty string → undefined)
const optionalString = () =>
  z.string().optional().or(z.literal('')).transform(v => v || undefined);

export const ThemeSchema = z.object({
  preset: permissiveEnum(['default', 'bold', 'minimal', 'pastel'], 'default'),
  aesthetic: permissiveEnum(['brutalist', 'editorial', 'retro-futuristic', 'organic', 'minimal', 'maximalist', 'art-deco', 'industrial'], 'editorial').optional(),
  accentColor: z.string().optional(),
  background: permissiveEnum(['light', 'dark'], 'light').optional(),
  font: permissiveEnum(['system', 'serif', 'mono'], 'system').optional(),
  fontPairing: FontPairingSchema.optional(),
  colors: ColorPaletteSchema.optional(),
});

export const HeroSectionSchema = z.object({
  type: z.literal('hero'),
  id: z.string().default(() => `hero-${Date.now()}`),
  headline: z.string().min(1, 'Headline is required').max(100, 'Headline must be under 100 characters'),
  subheadline: z.string().max(200, 'Subheadline must be under 200 characters').optional(),
  tagline: z.string().max(80, 'Tagline must be under 80 characters').optional(),
  cta: z.object({
    text: z.string().optional().default('Get Started'),
    href: z.string().optional().default('#'),
    variant: z.enum(['primary', 'secondary', 'ghost']).optional().or(z.literal('')).transform(v => v || undefined),
  }).optional(),
  secondaryCta: z.object({ text: z.string(), href: z.string() }).optional(),
  style: permissiveEnum(['centered', 'split', 'minimal', 'asymmetric', 'fullbleed'], 'centered'),
  layout: z.object({
    textAlign: permissiveEnum(['left', 'center', 'right'], 'left').optional(),
    verticalAlign: permissiveEnum(['top', 'center', 'bottom'], 'center').optional(),
    decorative: permissiveEnum(['none', 'shapes', 'lines', 'texture', 'gradient'], 'none').optional(),
  }).optional().or(z.string()).transform(v => typeof v === 'string' ? undefined : v),
});

export const AboutSectionSchema = z.object({
  type: z.literal('about'),
  id: z.string().default(() => `about-${Date.now()}`),
  heading: z.string().optional().default('About Us').transform(v => v || 'About Us'),
  body: z.string().max(500, 'About body must be under 500 characters').optional().transform(v => v || 'Tell your story here.'),
  avatarUrl: optionalString(),
  layout: permissiveEnum(['standard', 'split', 'editorial', 'minimal'], 'standard').optional(),
  stats: z.array(z.object({ label: z.string(), value: z.string() })).optional().default([]),
});

export const ProjectItemSchema = z.object({
  id: z.string(),
  title: z.string().optional().default('Project Title').transform(v => v || 'Project Title'),
  description: z.string().optional().default('Project description goes here.').transform(v => v || 'Project description goes here.'),
  href: optionalString(),
  tags: z.array(z.string()).optional().default([]),
  imageUrl: optionalString(),
  accentColor: z.string().optional(),
  size: permissiveEnum(['small', 'medium', 'large'], 'medium').optional(),
});

export const ProjectsSectionSchema = z.object({
  type: z.literal('projects'),
  id: z.string().default(() => `projects-${Date.now()}`),
  heading: z.string().optional().default('Projects').transform(v => v || 'Projects'),
  subheading: z.string().optional(),
  items: z.array(ProjectItemSchema).default([]),
  layout: permissiveEnum(['grid', 'list', 'masonry', 'featured'], 'grid').optional(),
  columns: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
});

export const TestimonialsSectionSchema = z.object({
  type: z.literal('testimonials'),
  id: z.string().default(() => `testimonials-${Date.now()}`),
  heading: z.string().optional().default('Testimonials').transform(v => v || 'Testimonials'),
  items: z.array(
    z.object({
      id: z.string(),
      quote: z.string().optional().default('Great experience!').transform(v => v || 'Great experience!'),
      name: z.string().optional().default('Client').transform(v => v || 'Client'),
      role: z.string().optional(),
      company: z.string().optional(),
      outcome: z.string().optional(),
    })
  ).default([]),
  layout: permissiveEnum(['grid', 'masonry', 'carousel'], 'grid').optional(),
});

export const ContactSectionSchema = z.object({
  type: z.literal('contact'),
  id: z.string().default(() => `contact-${Date.now()}`),
  heading: z.string().optional().default('Contact Us').transform(v => v || 'Contact Us'),
  subheading: z.string().optional(),
  email: optionalString(),
  phone: z.string().optional(),
  location: z.string().optional(),
  links: z.array(z.object({
    label: z.string().optional().default('Link').transform(v => v || 'Link'),
    href: z.string().optional().default('#').transform(v => v || '#'),
    icon: z.string().optional(),
  })).optional().default([]),
  layout: permissiveEnum(['simple', 'split', 'card', 'fullbleed'], 'simple').optional(),
  cta: z.object({ text: z.string(), href: z.string() }).optional(),
});

export const RawSectionSchema = z.object({
  type: z.literal('raw'),
  id: z.string().default(() => `raw-${Date.now()}`),
  label: z.string().optional(),
  content: z.any(),
});

export const SectionSchema = z.union([
  HeroSectionSchema,
  AboutSectionSchema,
  ProjectsSectionSchema,
  TestimonialsSectionSchema,
  ContactSectionSchema,
  RawSectionSchema,
]);

export const SiteContentSchema = z.object({
  version: z.literal('1.0'),
  sections: z.array(SectionSchema),
  theme: ThemeSchema,
  meta: z.object({
    title: z.string(),
    description: z.string(),
    ogImage: z.string().url().optional(),
  }),
  extras: z.record(z.string(), z.any()).optional(),
});
