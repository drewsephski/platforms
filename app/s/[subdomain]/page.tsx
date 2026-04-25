import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSiteForSubdomain } from '@/lib/sites';
import { SiteRenderer } from '@/components/site-renderer';
import { rootDomain } from '@/lib/utils';

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
    title: meta?.title || `${subdomain}.${rootDomain}`,
    description: meta?.description || `Site for ${subdomain}.${rootDomain}`,
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

  return <SiteRenderer content={site.content_json} />;
}
