'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ThemeToggle } from '@/components/theme-toggle';
import { Save, Eye, ArrowLeft, Loader2, Check, Globe, ExternalLink, ChevronDown, ChevronUp, Type, User, FolderGit2, Mail, Hash, Plus, Trash2, LayoutGrid, Settings2, Image, Link2, FileText, Palette, Monitor, ArrowRight, ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/components/animate-ui/components/base/accordion';
import Link from 'next/link';
import { protocol, rootDomain } from '@/lib/utils';
import type { SiteContent, Section } from '@/lib/types/site';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Site = {
  id: string;
  subdomain: string;
  status: string;
  content_json: SiteContent;
};

export function SiteEditor({ site, userId }: { site: Site; userId: string }) {
  const [content, setContent] = useState<SiteContent>(site.content_json);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [previewReady, setPreviewReady] = useState(false);
  const [editorOnLeft, setEditorOnLeft] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
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
    setSaveMessage('');

    try {
      const response = await fetch(`/api/sites/${site.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        setLastSaved(new Date());
        setSaveMessage('Saved');
        setTimeout(() => setSaveMessage(''), 2000);
      } else {
        setSaveMessage('Failed to save');
      }
    } catch (error) {
      setSaveMessage('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      const response = await fetch(`/api/sites/${site.id}/publish`, {
        method: 'POST',
      });

      if (response.ok) {
        setSaveMessage('Published successfully');
        setTimeout(() => setSaveMessage(''), 2000);
      } else {
        setSaveMessage('Failed to publish');
      }
    } catch (error) {
      setSaveMessage('Failed to publish');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSection = (sectionId: string, updates: any) => {
    setContent({
      ...content,
      sections: content.sections.map((s) =>
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    });
  };

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium transition-colors",
      status === 'published'
        ? "bg-emerald-50/80 text-emerald-700 border border-emerald-200/60"
        : "bg-amber-50/80 text-amber-700 border border-amber-200/60"
    )}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        status === 'published' ? "bg-emerald-500" : "bg-amber-500"
      )} />
      {status === 'published' ? 'Published' : 'Draft'}
    </span>
  );

  const sectionConfig: Record<string, { icon: React.ReactNode; label: string; description: string; color: string }> = {
    hero: { 
      icon: <Type className="w-4 h-4" />, 
      label: 'Hero',
      description: 'Main headline and call-to-action',
      color: 'bg-violet-50 text-violet-600 border-violet-200'
    },
    about: { 
      icon: <User className="w-4 h-4" />, 
      label: 'About',
      description: 'Your story and background',
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    projects: { 
      icon: <FolderGit2 className="w-4 h-4" />, 
      label: 'Projects',
      description: 'Showcase your work',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    contact: { 
      icon: <Mail className="w-4 h-4" />, 
      label: 'Contact',
      description: 'How to reach you',
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    },
  };

  const FieldGroup = ({ title, children, description }: { title: string; children: React.ReactNode; description?: string }) => (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );

  const FormField = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/70">{hint}</p>}
    </div>
  );

  const AccordionSection = ({ section, index }: { section: Section; index: number }) => {
    const config = sectionConfig[section.type] || {
      icon: <FileText className="w-4 h-4" />,
      label: section.type,
      description: 'Section content',
      color: 'bg-gray-50 text-gray-600 border-gray-200'
    };

    return (
      <AccordionItem value={section.id} className="group rounded-xl border border-border/40 bg-background/50 overflow-hidden">
        <AccordionTrigger className="w-full flex items-center justify-between px-4 py-4 hover:bg-secondary/50" showArrow={false}>
          <div className="flex items-center gap-3">
            <div className={cn("flex items-center justify-center w-9 h-9 rounded-lg border transition-colors", config.color)}>
              {config.icon}
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">{config.label}</h3>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
        </AccordionTrigger>
        <AccordionPanel>
          <div className="px-4 pb-4 pt-1 border-t border-border/30">
            <div className="pt-4 space-y-5">
              {section.type === 'hero' && (
                <>
                  <FieldGroup title="Main Message" description="The first thing visitors see">
                    <FormField label="Headline">
                      <Input
                        value={section.headline}
                        onChange={(e) => updateSection(section.id, { headline: e.target.value })}
                        placeholder="Your main headline"
                        className="text-sm"
                      />
                    </FormField>
                    <FormField label="Subheadline" hint="Optional supporting text">
                      <Input
                        value={section.subheadline || ''}
                        onChange={(e) => updateSection(section.id, { subheadline: e.target.value })}
                        placeholder="A brief description of what you do"
                        className="text-sm"
                      />
                    </FormField>
                    <FormField label="Tagline" hint="Small text above the headline">
                      <Input
                        value={section.tagline || ''}
                        onChange={(e) => updateSection(section.id, { tagline: e.target.value })}
                        placeholder="e.g., WELCOME TO MY WORLD"
                        className="text-sm"
                      />
                    </FormField>
                  </FieldGroup>

                  <FieldGroup title="Call to Action" description="Guide visitors to take action">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Button Text">
                        <Input
                          value={section.cta?.text || ''}
                          onChange={(e) =>
                            updateSection(section.id, {
                              cta: { ...section.cta, text: e.target.value, href: section.cta?.href || '#' }
                            })
                          }
                          placeholder="Get in Touch"
                          className="text-sm"
                        />
                      </FormField>
                      <FormField label="Button Link">
                        <Input
                          value={section.cta?.href || ''}
                          onChange={(e) =>
                            updateSection(section.id, {
                              cta: { ...section.cta, href: e.target.value, text: section.cta?.text || '' }
                            })
                          }
                          placeholder="#contact"
                          className="text-sm"
                        />
                      </FormField>
                    </div>
                  </FieldGroup>

                  <FieldGroup title="Appearance" description="How this section looks">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Style">
                        <select
                          value={section.style || 'centered'}
                          onChange={(e) => updateSection(section.id, { style: e.target.value as any })}
                          className="w-full h-9 px-2.5 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
                        >
                          <option value="centered">Centered</option>
                          <option value="asymmetric">Asymmetric</option>
                          <option value="split">Split</option>
                          <option value="fullbleed">Full Bleed</option>
                          <option value="minimal">Minimal</option>
                        </select>
                      </FormField>
                      <FormField label="Text Alignment">
                        <select
                          value={section.layout?.textAlign || 'center'}
                          onChange={(e) =>
                            updateSection(section.id, {
                              layout: { ...section.layout, textAlign: e.target.value as any }
                            })
                          }
                          className="w-full h-9 px-2.5 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </FormField>
                    </div>
                  </FieldGroup>
                </>
              )}

              {section.type === 'about' && (
                <>
                  <FieldGroup title="Content">
                    <FormField label="Heading">
                      <Input
                        value={section.heading}
                        onChange={(e) => updateSection(section.id, { heading: e.target.value })}
                        placeholder="About Me"
                        className="text-sm"
                      />
                    </FormField>
                    <FormField label="Body Text">
                      <Textarea
                        value={section.body}
                        onChange={(e) => updateSection(section.id, { body: e.target.value })}
                        rows={4}
                        placeholder="Tell your story..."
                        className="text-sm resize-none"
                      />
                    </FormField>
                  </FieldGroup>

                  <FieldGroup title="Layout">
                    <FormField label="Style">
                      <select
                        value={section.layout || 'standard'}
                        onChange={(e) => updateSection(section.id, { layout: e.target.value as any })}
                        className="w-full h-9 px-2.5 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
                      >
                        <option value="standard">Standard</option>
                        <option value="editorial">Editorial</option>
                        <option value="split">Split (with image)</option>
                        <option value="minimal">Minimal</option>
                      </select>
                    </FormField>
                    {section.layout === 'split' && (
                      <FormField label="Image URL" hint="Your photo or avatar">
                        <Input
                          value={section.avatarUrl || ''}
                          onChange={(e) => updateSection(section.id, { avatarUrl: e.target.value })}
                          placeholder="https://example.com/photo.jpg"
                          className="text-sm"
                        />
                      </FormField>
                    )}
                  </FieldGroup>
                </>
              )}

              {section.type === 'projects' && (
                <>
                  <FieldGroup title="Section Header">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Heading">
                        <Input
                          value={section.heading}
                          onChange={(e) => updateSection(section.id, { heading: e.target.value })}
                          placeholder="Selected Work"
                          className="text-sm"
                        />
                      </FormField>
                      <FormField label="Subheading">
                        <Input
                          value={section.subheading || ''}
                          onChange={(e) => updateSection(section.id, { subheading: e.target.value })}
                          placeholder="A few things I've built"
                          className="text-sm"
                        />
                      </FormField>
                    </div>
                  </FieldGroup>

                  <FieldGroup title="Layout Options">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Display Style">
                        <select
                          value={section.layout || 'grid'}
                          onChange={(e) => updateSection(section.id, { layout: e.target.value as any })}
                          className="w-full h-9 px-2.5 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
                        >
                          <option value="grid">Grid</option>
                          <option value="featured">Featured</option>
                          <option value="list">List</option>
                          <option value="masonry">Masonry</option>
                        </select>
                      </FormField>
                      <FormField label="Columns">
                        <select
                          value={section.columns || 2}
                          onChange={(e) => updateSection(section.id, { columns: Number(e.target.value) as 1|2|3 })}
                          className="w-full h-9 px-2.5 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
                        >
                          <option value={1}>1 column</option>
                          <option value={2}>2 columns</option>
                          <option value={3}>3 columns</option>
                        </select>
                      </FormField>
                    </div>
                  </FieldGroup>

                  <FieldGroup title="Projects" description={`${section.items.length} project${section.items.length !== 1 ? 's' : ''}`}>
                    <div className="space-y-3">
                      {section.items.map((item, idx) => (
                        <div 
                          key={item.id} 
                          className="rounded-lg border border-border/50 bg-background p-3 space-y-3"
                        >
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
                              className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                          <Input
                            value={item.title}
                            onChange={(e) => {
                              const newItems = [...section.items];
                              newItems[idx] = { ...item, title: e.target.value };
                              updateSection(section.id, { items: newItems });
                            }}
                            placeholder="Project Title"
                            className="text-sm"
                          />
                          <Textarea
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...section.items];
                              newItems[idx] = { ...item, description: e.target.value };
                              updateSection(section.id, { items: newItems });
                            }}
                            placeholder="Brief description of the project"
                            rows={2}
                            className="text-sm resize-none"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={item.href || ''}
                              onChange={(e) => {
                                const newItems = [...section.items];
                                newItems[idx] = { ...item, href: e.target.value };
                                updateSection(section.id, { items: newItems });
                              }}
                              placeholder="Link URL"
                              className="text-sm"
                            />
                            <Input
                              value={item.imageUrl || ''}
                              onChange={(e) => {
                                const newItems = [...section.items];
                                newItems[idx] = { ...item, imageUrl: e.target.value };
                                updateSection(section.id, { items: newItems });
                              }}
                              placeholder="Image URL"
                              className="text-sm"
                            />
                          </div>
                          <Input
                            value={item.tags?.join(', ') || ''}
                            onChange={(e) => {
                              const newItems = [...section.items];
                              newItems[idx] = { ...item, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) };
                              updateSection(section.id, { items: newItems });
                            }}
                            placeholder="Tags (comma separated)"
                            className="text-sm"
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateSection(section.id, {
                            items: [...section.items, { id: `proj-${Date.now()}`, title: '', description: '' }]
                          })
                        }
                        className="w-full h-9 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Add Project
                      </Button>
                    </div>
                  </FieldGroup>
                </>
              )}

              {section.type === 'contact' && (
                <>
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
                    <FormField label="Display Style">
                      <select
                        value={section.layout || 'simple'}
                        onChange={(e) => updateSection(section.id, { layout: e.target.value as any })}
                        className="w-full h-9 px-2.5 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
                      >
                        <option value="simple">Simple</option>
                        <option value="split">Split</option>
                        <option value="card">Card</option>
                        <option value="fullbleed">Full Bleed</option>
                      </select>
                    </FormField>
                  </FieldGroup>

                  <FieldGroup title="Social Links" description={`${(section.links || []).length} link${(section.links || []).length !== 1 ? 's' : ''}`}>
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
                            placeholder="Platform (e.g., Twitter)"
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
                        onClick={() =>
                          updateSection(section.id, {
                            links: [...(section.links || []), { label: '', href: '' }]
                          })
                        }
                        className="w-full h-9 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Add Link
                      </Button>
                    </div>
                  </FieldGroup>
                </>
              )}
            </div>
          </div>
        </AccordionPanel>
      </AccordionItem>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard"
              className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Back</span>
            </Link>
            <div className="h-4 w-px bg-border/60" />
            <div className="flex items-center gap-2.5">
              <h1 className="text-sm font-medium">
                {site.subdomain}.{rootDomain}
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
            {lastSaved && !saveMessage && (
              <span className="hidden sm:block text-xs text-muted-foreground">
                Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {saveMessage && (
              <span className={cn(
                "text-xs px-2 py-1 rounded-md transition-colors",
                saveMessage === 'Saved'
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-destructive bg-destructive/10"
              )}>
                {saveMessage}
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
                href={`${protocol}://${site.subdomain}.${rootDomain}`}
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
            <Accordion>
              <div className="space-y-3">
                {content.sections
                  .filter(section => sectionConfig[section.type])
                  .map((section, index) => (
                    <AccordionSection key={section.id} section={section} index={index} />
                  ))}
              </div>
            </Accordion>

            {/* Metadata */}
            <div className="rounded-xl border border-border/60 bg-background overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/30">
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
            </div>
          </div>

          {/* Preview */}
          <div className={cn("space-y-4", !editorOnLeft && "lg:order-1")}>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-medium">Live Preview</h2>
            </div>
            <div className="rounded-xl border border-border/60 overflow-hidden shadow-sm bg-background">
              <div className="bg-muted/40 px-3 py-2 text-xs text-muted-foreground border-b border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
                  </div>
                  <span className="ml-1">Preview</span>
                </div>
                <span className="text-muted-foreground/50 truncate max-w-[200px]">
                  {site.subdomain}.{rootDomain}
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