"use client";

import Link from "next/link";
import SiteShell from "@/components/SiteShell";

type Props = {
  title: string;
  description: string;
  icon?: React.ReactNode;
};

export default function ToolTeaser({ title, description, icon }: Props) {
  return (
    <SiteShell>
      <div className="section-container flex min-h-[60vh] items-center justify-center py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-black/60 p-10 text-center shadow-2xl">
          {icon && <div className="mb-6 flex justify-center">{icon}</div>}
          <h1 className="text-2xl font-serif text-white md:text-3xl">{title}</h1>
          <p className="mt-4 text-gray-400">{description}</p>
          <p className="mt-6 text-sm text-gold">
            Create a free account to run this tool and unlock your dashboard.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/register" className="btn-primary inline-block px-6 py-3 text-center">
              Start Free Account
            </Link>
            <Link
              href="/login"
              className="inline-block rounded-full border border-white/20 bg-white/5 px-6 py-3 text-center text-sm font-medium text-white transition hover:bg-white/10"
            >
              Login
            </Link>
          </div>
          <p className="mt-6 text-xs text-gray-500">
            Already have an account?{" "}
            <Link href="/dashboard" className="text-gold hover:underline">
              Go to Dashboard
            </Link>
          </p>
        </div>
      </div>
    </SiteShell>
  );
}
