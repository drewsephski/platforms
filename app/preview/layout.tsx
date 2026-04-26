export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Minimal layout for preview - no main navigation or footer
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
