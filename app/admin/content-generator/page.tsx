import { redirect } from "next/navigation";
import { requireAdminOrOwner } from "@/lib/auth";
import { ContentGeneratorClient } from "./ContentGeneratorClient";

export const metadata = {
  title: "Content Generator | Admin | VDB Digital",
  description: "AI-contentgenerator voor kennisbankartikelen.",
};

export default async function AdminContentGeneratorPage() {
  const user = await requireAdminOrOwner();
  if (!user) redirect("/dashboard");

  return (
    <div className="rounded-2xl border border-white/10 bg-black/80 p-6 shadow-sm backdrop-blur-xl">
      <h1 className="text-xl font-semibold text-white">AI Content Generator</h1>
      <p className="mt-1 text-sm text-gray-400">
        Genereer titels en volledige SEO-artikelen voor de kennisbank. Artikelen verschijnen op /kennisbank/[slug].
      </p>
      <ContentGeneratorClient />
    </div>
  );
}
