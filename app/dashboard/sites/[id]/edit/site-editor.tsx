'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/theme-toggle';
import { Save, Eye, ArrowLeft, Loader2, Globe, ExternalLink, Type, User, FolderGit2, Mail, Plus, Trash2, Settings2, FileText, Monitor, ArrowRight, ArrowLeft as ArrowLeftIcon, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { getSiteUrl } from '@/lib/utils';
import type { SiteContent, Section } from '@/lib/types/site';
import { cn } from '@/lib/utils';

type Site = {
  id: string;
  subdomain: string;
  status: string;
  content_json: SiteContent;
};

export function SiteEditor({ site }: { site: Site }) {
  const [content, setContent] = useState<SiteContent>(site.content_json);
  const [isSaving, setIsSaving] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [editorOnLeft, setEditorOnLeft] = useState(true);
  const [openSections, setOpenSections] = useState<string[]>(['hero']);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Send content to preview iframe whenever it changes
  useEffect(() => {
    if (!previewReady || !iframeRef.current) return;

    // Debounce updates to avoid excessive re-renders
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: 'preview-content',
          content: JSON.stringify(content),
        },
        window.location.origin
      );
    }, 150);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [content, previewReady]);

  // Listen for preview-ready message from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'preview-ready') {
        setPreviewReady(true);
        // Send initial content
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: 'preview-content',
            content: JSON.stringify(content),
          },
          window.location.origin
        );
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [content]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/sites/${site.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        setLastSaved(new Date());
        toast.success('Changes saved');
      } else {
        toast.error('Failed to save changes');
      }
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/sites/${site.id}/publish`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Site published successfully');
      } else {
        toast.error('Failed to publish site');
      }
    } catch {
      toast.error('Failed to publish site');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    setContent({
      ...content,
      sections: content.sections.map((s) =>
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    });
  };

  const StatusBadge = ({ status }: { status: string }) => (
    <span className="text-xs text-muted-foreground">
      {status === 'published' ? 'Published' : 'Draft'}
    </span>
  );

  const sectionConfig: Record<string, { icon: React.ReactNode; label: string; description: string }> = {
    hero: { icon: <Type className="w-4 h-4" />, label: 'Hero', description: 'First impression with value proposition' },
    about: { icon: <User className="w-4 h-4" />, label: 'About', description: 'Your story and achievements' },
    projects: { icon: <FolderGit2 className="w-4 h-4" />, label: 'Projects', description: 'Work samples with outcomes' },
    contact: { icon: <Mail className="w-4 h-4" />, label: 'Contact', description: 'How to reach you' },
  };

  const FormField = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/70">{hint}</p>}
    </div>
  );

  const FieldGroup = ({ title, children, description }: { title: string; children: React.ReactNode; description?: string }) => (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-medium">{title}</h4>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );

  const SelectField = ({
    label,
    hint,
    value,
    onChange,
    options,
  }: {
    label: string;
    hint?: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
  }) => (
    <FormField label={label} hint={hint}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );

  function SectionEditor({ section }: { section: Section }) {
    const config = sectionConfig[section.type] || {
      icon: <FileText className="w-4 h-4" />,
      label: section.type,
      description: 'Section content',
    };

    const renderHeroFields = () => (
      <div className="space-y-5">
        <FieldGroup title="Main Message" description="Specific value proposition">
          <FormField label="Headline" hint="6-12 words, benefit-driven">
            <Input
              value={section.headline}
              onChange={(e) => updateSection(section.id, { headline: e.target.value })}
              placeholder="e.g., 'Design systems that scale engineering teams'"
              className="text-sm"
            />
          </FormField>
          <FormField label="Subheadline" hint="15-25 words with concrete details">
            <Input
              value={section.subheadline || ''}
              onChange={(e) => updateSection(section.id, { subheadline: e.target.value })}
              placeholder="Formerly at Vercel. Now helping startups ship faster..."
              className="text-sm"
            />
          </FormField>
          <FormField label="Tagline" hint="Differentiator above headline">
            <Input
              value={section.tagline || ''}
              onChange={(e) => updateSection(section.id, { tagline: e.target.value })}
              placeholder="e.g., 'INDEPENDENT DESIGN ENGINEER'"
              className="text-sm"
            />
          </FormField>
        </FieldGroup>

        <FieldGroup title="Call to Action">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Button Text" hint="Verb + benefit">
              <Input
                value={section.cta?.text || ''}
                onChange={(e) =>
                  updateSection(section.id, {
                    cta: { ...section.cta, text: e.target.value, href: section.cta?.href || '#' },
                  })
                }
                placeholder="e.g., 'Book consultation'"
                className="text-sm"
              />
            </FormField>
            <FormField label="Button Link">
              <Input
                value={section.cta?.href || ''}
                onChange={(e) =>
                  updateSection(section.id, {
                    cta: { ...section.cta, href: e.target.value, text: section.cta?.text || '' },
                  })
                }
                placeholder="#contact"
                className="text-sm"
              />
            </FormField>
          </div>
        </FieldGroup>

        <FieldGroup title="Layout">
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Style"
              hint="Visual arrangement"
              value={section.style || 'centered'}
              onChange={(value) => updateSection(section.id, { style: value })}
              options={[
                { value: 'asymmetric', label: 'Asymmetric' },
                { value: 'centered', label: 'Centered' },
                { value: 'split', label: 'Split' },
                { value: 'fullbleed', label: 'Full Bleed' },
                { value: 'minimal', label: 'Minimal' },
              ]}
            />
            <SelectField
              label="Text Alignment"
              value={section.layout?.textAlign || 'center'}
              onChange={(value) =>
                updateSection(section.id, {
                  layout: { ...section.layout, textAlign: value as any },
                })
              }
              options={[
                { value: 'left', label: 'Left' },
                { value: 'center', label: 'Center' },
                { value: 'right', label: 'Right' },
              ]}
            />
          </div>
        </FieldGroup>
      </div>
    );

    const renderAboutFields = () => (
      <div className="space-y-5">
        <FieldGroup title="Content" description="Your story">
          <FormField label="Heading" hint="Benefit-driven">
            <Input
              value={section.heading}
              onChange={(e) => updateSection(section.id, { heading: e.target.value })}
              placeholder="e.g., 'Where design systems meet business impact'"
              className="text-sm"
            />
          </FormField>
          <FormField label="Body Text" hint="3-4 paragraphs">
            <Textarea
              value={section.body}
              onChange={(e) => updateSection(section.id, { body: e.target.value })}
              rows={5}
              placeholder="Started in 2018 after seeing too many teams rebuild..."
              className="text-sm resize-none"
            />
          </FormField>
        </FieldGroup>

        <FieldGroup title="Layout">
          <SelectField
            label="Style"
            value={section.layout || 'standard'}
            onChange={(value) => updateSection(section.id, { layout: value })}
            options={[
              { value: 'standard', label: 'Standard' },
              { value: 'editorial', label: 'Editorial' },
              { value: 'split', label: 'Split (with image)' },
              { value: 'minimal', label: 'Minimal' },
            ]}
          />
          {section.layout === 'split' && (
            <FormField label="Image URL" hint="Your photo">
              <Input
                value={section.avatarUrl || ''}
                onChange={(e) => updateSection(section.id, { avatarUrl: e.target.value })}
                placeholder="https://example.com/photo.jpg"
                className="text-sm mt-3"
              />
            </FormField>
          )}
        </FieldGroup>
      </div>
    );

    const renderProjectsFields = () => (
      <div className="space-y-5">
        <FieldGroup title="Section Header">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Heading">
              <Input
                value={section.heading}
                onChange={(e) => updateSection(section.id, { heading: e.target.value })}
                placeholder="e.g., 'Selected projects'"
                className="text-sm"
              />
            </FormField>
            <FormField label="Subheading">
              <Input
                value={section.subheading || ''}
                onChange={(e) => updateSection(section.id, { subheading: e.target.value })}
                placeholder="e.g., 'Where strategy met execution'"
                className="text-sm"
              />
            </FormField>
          </div>
        </FieldGroup>

        <FieldGroup title="Layout">
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Display Style"
              value={section.layout || 'grid'}
              onChange={(value) => updateSection(section.id, { layout: value })}
              options={[
                { value: 'featured', label: 'Featured' },
                { value: 'grid', label: 'Grid' },
                { value: 'list', label: 'List' },
                { value: 'masonry', label: 'Masonry' },
              ]}
            />
            <SelectField
              label="Columns"
              value={String(section.columns || 2)}
              onChange={(value) => updateSection(section.id, { columns: Number(value) as 1 | 2 | 3 })}
              options={[
                { value: '1', label: '1 column' },
                { value: '2', label: '2 columns' },
                { value: '3', label: '3 columns' },
              ]}
            />
          </div>
        </FieldGroup>

        <FieldGroup title={`Projects (${section.items.length})`}>
          <div className="space-y-3">
            {section.items.map((item, idx) => (
              <div key={item.id} className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Project {idx + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newItems = section.items.filter((_, i) => i !== idx);
                      updateSection(section.id, { items: newItems });
                    }}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <FormField label="Title">
                  <Input
                    value={item.title}
                    onChange={(e) => {
                      const newItems = [...section.items];
                      newItems[idx] = { ...item, title: e.target.value };
                      updateSection(section.id, { items: newItems });
                    }}
                    placeholder="e.g., 'SaaS redesign: 40% conversion lift'"
                    className="text-sm"
                  />
                </FormField>
                <FormField label="Description">
                  <Textarea
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...section.items];
                      newItems[idx] = { ...item, description: e.target.value };
                      updateSection(section.id, { items: newItems });
                    }}
                    placeholder="Challenge, approach, and quantified result..."
                    rows={2}
                    className="text-sm resize-none"
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-2">
                  <FormField label="Link URL">
                    <Input
                      value={item.href || ''}
                      onChange={(e) => {
                        const newItems = [...section.items];
                        newItems[idx] = { ...item, href: e.target.value };
                        updateSection(section.id, { items: newItems });
                      }}
                      placeholder="# or https://..."
                      className="text-sm"
                    />
                  </FormField>
                  <FormField label="Accent Color">
                    <Input
                      value={item.accentColor || ''}
                      onChange={(e) => {
                        const newItems = [...section.items];
                        newItems[idx] = { ...item, accentColor: e.target.value };
                        updateSection(section.id, { items: newItems });
                      }}
                      placeholder="#1e3a5f"
                      className="text-sm font-mono"
                    />
                  </FormField>
                </div>
                <FormField label="Tags" hint="Comma separated">
                  <Input
                    value={item.tags?.join(', ') || ''}
                    onChange={(e) => {
                      const newItems = [...section.items];
                      newItems[idx] = { ...item, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) };
                      updateSection(section.id, { items: newItems });
                    }}
                    placeholder="e.g., React, UX Strategy"
                    className="text-sm"
                  />
                </FormField>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                updateSection(section.id, {
                  items: [...section.items, { id: `proj-${Date.now()}`, title: '', description: '', accentColor: '#1e3a5f' }],
                })
              }
              className="w-full h-9 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Project
            </Button>
          </div>
        </FieldGroup>
      </div>
    );

    const renderContactFields = () => (
      <div className="space-y-5">
        <FieldGroup title="Header">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Heading">
              <Input
                value={section.heading}
                onChange={(e) => updateSection(section.id, { heading: e.target.value })}
                placeholder="Get in Touch"
                className="text-sm"
              />
            </FormField>
            <FormField label="Subheading">
              <Input
                value={section.subheading || ''}
                onChange={(e) => updateSection(section.id, { subheading: e.target.value })}
                placeholder="Let's work together"
                className="text-sm"
              />
            </FormField>
          </div>
        </FieldGroup>

        <FieldGroup title="Contact Details">
          <FormField label="Email Address">
            <Input
              type="email"
              value={section.email || ''}
              onChange={(e) => updateSection(section.id, { email: e.target.value })}
              placeholder="hello@example.com"
              className="text-sm"
            />
          </FormField>
        </FieldGroup>

        <FieldGroup title="Layout">
          <SelectField
            label="Display Style"
            value={section.layout || 'simple'}
            onChange={(value) => updateSection(section.id, { layout: value })}
            options={[
              { value: 'simple', label: 'Simple' },
              { value: 'split', label: 'Split' },
              { value: 'card', label: 'Card' },
              { value: 'fullbleed', label: 'Full Bleed' },
            ]}
          />
        </FieldGroup>

        <FieldGroup title={`Social Links (${(section.links || []).length})`}>
          <div className="space-y-2">
            {(section.links || []).map((link, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={link.label}
                  onChange={(e) => {
                    const newLinks = [...(section.links || [])];
                    newLinks[idx] = { ...link, label: e.target.value };
                    updateSection(section.id, { links: newLinks });
                  }}
                  placeholder="Platform"
                  className="text-sm flex-1"
                />
                <Input
                  value={link.href}
                  onChange={(e) => {
                    const newLinks = [...(section.links || [])];
                    newLinks[idx] = { ...link, href: e.target.value };
                    updateSection(section.id, { links: newLinks });
                  }}
                  placeholder="URL"
                  className="text-sm flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newLinks = (section.links || []).filter((_, i) => i !== idx);
                    updateSection(section.id, { links: newLinks });
                  }}
                  className="h-9 w-9 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => updateSection(section.id, { links: [...(section.links || []), { label: '', href: '' }] })}
              className="w-full h-9 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Link
            </Button>
          </div>
        </FieldGroup>
      </div>
    );

    const contentVariants = {
      hidden: { opacity: 0, height: 0 },
      visible: {
        opacity: 1,
        height: 'auto',
        transition: {
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94],
          staggerChildren: 0.03,
        },
      },
      exit: {
        opacity: 0,
        height: 0,
        transition: {
          duration: 0.2,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      },
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 8 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.25,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      },
    };

    const renderAnimatedFields = () => {
      let fields;
      switch (section.type) {
        case 'hero':
          fields = renderHeroFields();
          break;
        case 'about':
          fields = renderAboutFields();
          break;
        case 'projects':
          fields = renderProjectsFields();
          break;
        case 'contact':
          fields = renderContactFields();
          break;
        default:
          fields = null;
      }
      return fields;
    };

    return (
      <AccordionItem value={section.id} className="border-b border-border last:border-b-0">
        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors duration-200 [&[data-state=open]]:bg-muted/50">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary"
            >
              {config.icon}
            </motion.div>
            <div className="text-left">
              <h3 className="text-sm font-medium">{config.label}</h3>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 overflow-hidden">
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={contentVariants}
            className="pt-2"
          >
            <motion.div variants={itemVariants}>
              {renderAnimatedFields()}
            </motion.div>
          </motion.div>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-medium">
                /s/{site.subdomain}
              </h1>
              <StatusBadge status={site.status} />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditorOnLeft(!editorOnLeft)}
              className="h-8 w-8"
              title="Toggle layout"
            >
              {editorOnLeft ? (
                <ArrowRight className="w-4 h-4" />
              ) : (
                <ArrowLeftIcon className="w-4 h-4" />
              )}
            </Button>
            {lastSaved && (
              <span className="hidden sm:block text-xs text-muted-foreground">
                Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 text-xs"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 mr-1.5" />
              )}
              Save
            </Button>
            {site.status === 'draft' ? (
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={isSaving}
                className="h-8 text-xs"
              >
                Publish
              </Button>
            ) : (
              <a
                href={getSiteUrl(site.subdomain)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  View
                </Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className={cn("space-y-6", !editorOnLeft && "lg:order-2")}>
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-border/40">
              <Settings2 className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-medium">Editor</h2>
              <span className="text-xs text-muted-foreground ml-auto">
                {content.sections.length} sections
              </span>
            </div>

            {/* Sections */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Accordion
                type="multiple"
                value={openSections}
                onValueChange={setOpenSections}
                className="border border-border rounded-lg overflow-hidden bg-background"
              >
                <AnimatePresence mode="popLayout">
                  {content.sections
                    .filter(section => sectionConfig[section.type])
                    .map((section, index) => (
                      <motion.div
                        key={section.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{
                          duration: 0.25,
                          delay: index * 0.05,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                      >
                        <SectionEditor key={section.id} section={section as Section} />
                      </motion.div>
                    ))}
                </AnimatePresence>
              </Accordion>
            </motion.div>

            {/* Metadata */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="border border-border rounded-lg overflow-hidden bg-background"
            >
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border">
                <Monitor className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Site Settings</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Page Title</Label>
                  <Input
                    value={content.meta.title}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        meta: { ...content.meta, title: e.target.value },
                      })
                    }
                    placeholder="Site title for browser tab"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Meta Description</Label>
                  <Textarea
                    value={content.meta.description}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        meta: { ...content.meta, description: e.target.value },
                      })
                    }
                    rows={2}
                    placeholder="Description for search engines"
                    className="text-sm resize-none"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Preview */}
          <div className={cn("space-y-4", !editorOnLeft && "lg:order-1")}>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-medium">Preview</h2>
            </div>
            <div className="border border-border rounded-lg overflow-hidden bg-background">
              <div className="bg-muted/40 px-3 py-2 text-xs text-muted-foreground border-b border-border flex items-center justify-between">
                <span>Preview</span>
                <span className="truncate max-w-[200px]">
                  /s/{site.subdomain}
                </span>
              </div>
              <div className="relative bg-background" style={{ height: 'calc(100vh - 240px)', minHeight: '500px' }}>
                <iframe
                  ref={iframeRef}
                  src="/preview"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                  title="Site Preview"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}