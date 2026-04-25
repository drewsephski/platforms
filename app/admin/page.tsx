import { getAllSubdomains } from '@/lib/subdomains';
import type { Metadata } from 'next';
import { AdminDashboard } from './dashboard';
import { rootDomain } from '@/lib/utils';

export const metadata: Metadata = {
  title: `Admin | ${rootDomain}`,
  description: `Manage sites for ${rootDomain}`
};

export default async function AdminPage() {
  // TODO: You can add authentication here with your preferred auth provider
  const tenants = await getAllSubdomains();

  return <AdminDashboard tenants={tenants} />;
}
