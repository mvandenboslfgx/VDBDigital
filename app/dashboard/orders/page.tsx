import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function DashboardOrdersPage() {
  const user = await requireUser();
  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Bestellingen
        </h1>
        <p className="mt-2 text-zinc-500">
          Je bestellingen van apparaten en hardware.
        </p>
      </div>
      <div className="rounded-2xl border border-white/[0.06] bg-[#111113] p-12 text-center shadow-panel">
        <p className="text-zinc-500">
          Je hebt nog geen bestellingen. Bestel smart TV- en streamingapparaten in de webshop.
        </p>
        <Link
          href="/apparaten"
          className="mt-4 inline-block rounded-xl bg-gold px-6 py-3 font-semibold text-black hover:bg-goldHover"
        >
          Naar apparaten
        </Link>
      </div>
    </div>
  );
}
