import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSiteForSubdomain } from '@/lib/sites';
import { SiteRenderer } from '@/components/site-renderer';
import { AnalyticsTracker } from '@/components/analytics-tracker';
import { rootDomain, getSiteUrl } from '@/lib/utils';

// Cache configuration: 60s fresh, 5min stale-while-revalidate
export const revalidate = 60;

export async function generateMetadata({
  params
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const site = await getSiteForSubdomain(subdomain);

  if (!site) {
    return {
      title: rootDomain
    };
  }

  const meta = site.content_json?.meta;
  return {
    title: meta?.title || `${subdomain}`,
    description: meta?.description || `Site for ${subdomain}`,
  };
}

export default async function SubdomainPage({
  params
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const site = await getSiteForSubdomain(subdomain);

  if (!site) {
    notFound();
  }

  return (
    <>
      <SiteRenderer content={site.content_json} />
      <AnalyticsTracker siteId={site.id} />
    </>
  );
}
