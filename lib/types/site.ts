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
  headline?: string;
  subheadline?: string;
  tagline?: string;
  cta?: { text?: string; href?: string; variant?: 'primary' | 'secondary' | 'ghost' };
  secondaryCta?: { text?: string; href?: string };
  style?: 'centered' | 'split' | 'minimal' | 'asymmetric' | 'fullbleed';
  layout?: {
    textAlign?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'center' | 'bottom';
    decorative?: 'none' | 'shapes' | 'lines' | 'texture' | 'gradient' | 'grain' | 'mesh' | 'aurora';
  };
  backgroundEffect?: 'none' | 'gradient' | 'mesh' | 'aurora' | 'noise' | 'dots' | 'lines';
};

export type AboutSection = {
  type: 'about';
  id: string;
  heading?: string;
  body?: string;
  avatarUrl?: string;
  imageUrl?: string;
  layout?: 'standard' | 'split' | 'editorial' | 'minimal' | 'cards' | 'timeline';
  stats?: { label?: string; value?: string }[];
  features?: { title?: string; description?: string; icon?: string }[];
};

export type ProjectItem = {
  id: string;
  title?: string;
  description?: string;
  href?: string;
  tags?: string[];
  imageUrl?: string;
  accentColor?: string;
  size?: 'small' | 'medium' | 'large';
  category?: string;
  year?: string;
};

export type ProjectsSection = {
  type: 'projects';
  id: string;
  heading?: string;
  subheading?: string;
  items?: ProjectItem[];
  layout?: 'grid' | 'list' | 'masonry' | 'featured' | 'carousel' | 'bento';
  columns?: 1 | 2 | 3 | 4;
  filterable?: boolean;
};

export type TestimonialsSection = {
  type: 'testimonials';
  id: string;
  heading?: string;
  subheading?: string;
  items?: {
    id: string;
    quote?: string;
    name?: string;
    role?: string;
    company?: string;
    outcome?: string;
    avatarUrl?: string;
    rating?: number;
  }[];
  layout?: 'grid' | 'masonry' | 'carousel' | 'stack' | 'floating';
};

export type ContactSection = {
  type: 'contact';
  id: string;
  heading?: string;
  subheading?: string;
  body?: string;
  email?: string;
  phone?: string;
  location?: string;
  availability?: string;
  responseTime?: string;
  links?: { label?: string; href?: string; icon?: string }[];
  layout?: 'simple' | 'split' | 'card' | 'fullbleed' | 'minimal';
  cta?: { text?: string; href?: string; variant?: 'primary' | 'secondary' | 'ghost' };
  socials?: { platform?: string; url?: string; handle?: string }[];
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

// Default content generators for guaranteed rendering
export const defaultContent = {
  hero: {
    headline: 'Craft something extraordinary',
    subheadline: 'We build digital experiences that captivate, convert, and create lasting impressions.',
    tagline: 'Welcome',
    cta: { text: 'Get Started', href: '#contact', variant: 'primary' as const },
  },
  about: {
    heading: 'About Us',
    body: 'We are a team of creators, strategists, and builders dedicated to crafting exceptional digital experiences. Our work bridges the gap between vision and reality, transforming ideas into impactful solutions.',
  },
  projects: {
    heading: 'Our Work',
    items: [
      { id: '1', title: 'Featured Project', description: 'A showcase of craft and attention to detail', href: '#', tags: [], imageUrl: undefined, size: 'medium' as const },
      { id: '2', title: 'Recent Work', description: 'Designed with purpose and built with precision', href: '#', tags: [], imageUrl: undefined, size: 'medium' as const },
    ],
  },
  testimonials: {
    heading: 'What People Say',
    items: [
      { id: '1', quote: 'Exceptional work that exceeded all expectations.', name: 'Client Name', role: undefined, company: undefined, outcome: undefined, avatarUrl: undefined, rating: undefined },
    ],
  },
  contact: {
    heading: 'Get in Touch',
    subheading: 'We would love to hear from you.',
    email: 'hello@example.com',
  },
};

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
}).passthrough();

export const HeroSectionSchema = z.object({
  type: z.literal('hero'),
  id: z.string().default(() => `hero-${Date.now()}`),
  headline: z.string().min(1).max(100).optional().default(defaultContent.hero.headline),
  subheadline: z.string().max(300).optional().default(defaultContent.hero.subheadline),
  tagline: z.string().max(80).optional().default(defaultContent.hero.tagline),
  cta: z.object({
    text: z.string().optional().default(defaultContent.hero.cta.text),
    href: z.string().optional().default(defaultContent.hero.cta.href),
    variant: z.enum(['primary', 'secondary', 'ghost']).optional().default('primary'),
  }).optional().default(defaultContent.hero.cta),
  secondaryCta: z.object({ text: z.string().optional(), href: z.string().optional() }).optional(),
  style: permissiveEnum(['centered', 'split', 'minimal', 'asymmetric', 'fullbleed'], 'centered').optional().default('centered'),
  layout: z.object({
    textAlign: permissiveEnum(['left', 'center', 'right'], 'center').optional().default('center'),
    verticalAlign: permissiveEnum(['top', 'center', 'bottom'], 'center').optional().default('center'),
    decorative: permissiveEnum(['none', 'shapes', 'lines', 'texture', 'gradient', 'grain', 'mesh', 'aurora'], 'gradient').optional().default('gradient'),
  }).optional().default({ textAlign: 'center', verticalAlign: 'center', decorative: 'gradient' }),
  backgroundEffect: permissiveEnum(['none', 'gradient', 'mesh', 'aurora', 'noise', 'dots', 'lines'], 'gradient').optional().default('gradient'),
}).passthrough();

export const AboutSectionSchema = z.object({
  type: z.literal('about'),
  id: z.string().default(() => `about-${Date.now()}`),
  heading: z.string().optional().default(defaultContent.about.heading),
  body: z.string().optional().default(defaultContent.about.body),
  avatarUrl: optionalString(),
  imageUrl: optionalString(),
  layout: permissiveEnum(['standard', 'split', 'editorial', 'minimal', 'cards', 'timeline'], 'editorial').optional().default('editorial'),
  stats: z.array(z.object({ label: z.string().optional(), value: z.string().optional() })).optional().default([]),
  features: z.array(z.object({ title: z.string().optional(), description: z.string().optional(), icon: z.string().optional() })).optional().default([]),
}).passthrough();

export const ProjectItemSchema = z.object({
  id: z.string(),
  title: z.string().optional().default('Project'),
  description: z.string().optional().default('A showcase of craft and attention to detail.'),
  href: z.string().optional().default('#'),
  tags: z.array(z.string()).optional().default([]),
  imageUrl: optionalString(),
  accentColor: z.string().optional(),
  size: permissiveEnum(['small', 'medium', 'large'], 'medium').optional().default('medium'),
  category: z.string().optional(),
  year: z.string().optional(),
});

export const ProjectsSectionSchema = z.object({
  type: z.literal('projects'),
  id: z.string().default(() => `projects-${Date.now()}`),
  heading: z.string().optional().default(defaultContent.projects.heading),
  subheading: z.string().optional(),
  items: z.array(ProjectItemSchema).default(defaultContent.projects.items),
  layout: permissiveEnum(['grid', 'list', 'masonry', 'featured', 'carousel', 'bento'], 'featured').optional().default('featured'),
  columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
  filterable: z.boolean().optional().default(false),
}).passthrough();

export const TestimonialsSectionSchema = z.object({
  type: z.literal('testimonials'),
  id: z.string().default(() => `testimonials-${Date.now()}`),
  heading: z.string().optional().default(defaultContent.testimonials.heading),
  subheading: z.string().optional(),
  items: z.array(
    z.object({
      id: z.string(),
      quote: z.string().optional().default('Exceptional work that exceeded expectations.'),
      name: z.string().optional().default('Client'),
      role: z.string().optional(),
      company: z.string().optional(),
      outcome: z.string().optional(),
      avatarUrl: z.string().optional(),
      rating: z.number().min(1).max(5).optional(),
    })
  ).default(defaultContent.testimonials.items),
  layout: permissiveEnum(['grid', 'masonry', 'carousel', 'stack', 'floating'], 'masonry').optional().default('masonry'),
}).passthrough();

export const ContactSectionSchema = z.object({
  type: z.literal('contact'),
  id: z.string().default(() => `contact-${Date.now()}`),
  heading: z.string().optional().default(defaultContent.contact.heading),
  subheading: z.string().optional().default(defaultContent.contact.subheading),
  body: z.string().optional(),
  email: z.string().optional().default(defaultContent.contact.email),
  phone: z.string().optional(),
  location: z.string().optional(),
  availability: z.string().optional(),
  responseTime: z.string().optional(),
  links: z.array(z.object({
    label: z.string().optional().default('Link'),
    href: z.string().optional().default('#'),
    icon: z.string().optional(),
  })).optional().default([]),
  layout: permissiveEnum(['simple', 'split', 'card', 'fullbleed', 'minimal'], 'split').optional().default('split'),
  cta: z.object({ text: z.string().optional(), href: z.string().optional(), variant: z.enum(['primary', 'secondary', 'ghost']).optional() }).optional(),
  socials: z.array(z.object({ platform: z.string().optional(), url: z.string().optional(), handle: z.string().optional() })).optional().default([]),
}).passthrough();

export const RawSectionSchema = z.object({
  type: z.literal('raw'),
  id: z.string().default(() => `raw-${Date.now()}`),
  label: z.string().optional(),
  content: z.any(),
}).passthrough();

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
    ogImage: z.string().optional().or(z.literal('')).transform(v => v || undefined),
  }),
  extras: z.record(z.string(), z.any()).optional(),
}).passthrough();
