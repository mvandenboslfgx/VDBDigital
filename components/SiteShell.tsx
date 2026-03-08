import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";

export default function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing relative min-h-screen bg-marketing-bg text-marketing-text">
      <Navbar />
      <main className="min-h-screen pt-24 pb-4">{children}</main>
      <SiteFooter />
    </div>
  );
}

