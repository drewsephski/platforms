import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Site',
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Minimal layout for generated sites - no main navigation or footer
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
