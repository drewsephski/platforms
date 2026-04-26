'use client';

import Script from 'next/script';

interface AnalyticsTrackerProps {
  siteId: string;
}

/**
 * Client-side analytics tracker component
 * Injects a lightweight beacon script into public-facing sites
 */
export function AnalyticsTracker({ siteId }: AnalyticsTrackerProps) {
  const analyticsScript = `
    (function() {
      var tracked = false;
      function track() {
        if (tracked) return;
        tracked = true;
        fetch('${process.env.NEXT_PUBLIC_APP_URL || ''}/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            site_id: '${siteId}',
            path: location.pathname,
            referrer: document.referrer
          }),
          keepalive: true
        }).catch(function() {});
      }
      if (document.visibilityState === 'visible') {
        track();
      } else {
        document.addEventListener('visibilitychange', function() {
          if (document.visibilityState === 'visible') track();
        });
      }
    })();
  `;

  return (
    <Script
      id="site-analytics"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{ __html: analyticsScript }}
    />
  );
}
