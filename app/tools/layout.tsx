import SiteShell from "@/components/SiteShell";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteShell>
      <main className="min-h-screen pt-24 pb-12">{children}</main>
    </SiteShell>
  );
}
