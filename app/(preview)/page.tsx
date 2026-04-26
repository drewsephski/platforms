'use client';

import { useState, useEffect, useCallback } from 'react';
import { SiteRenderer } from '@/components/site-renderer';
import type { SiteContent } from '@/lib/types/site';

export default function PreviewPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Listen for content updates from parent window
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from the same origin
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'preview-content') {
        try {
          const newContent = JSON.parse(event.data.content);
          setContent(newContent);
        } catch {
          console.error('Failed to parse preview content');
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Notify parent that preview is ready to receive content
    window.parent.postMessage({ type: 'preview-ready' }, '*');
    setIsReady(true);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-muted/30 border-t-muted rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Waiting for preview content...</p>
        </div>
      </div>
    );
  }

  return <SiteRenderer content={content} />;
}
