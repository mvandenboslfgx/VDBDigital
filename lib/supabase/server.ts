import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getServerEnv } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();
  const serverEnv = getServerEnv();
  const url = serverEnv.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !key) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Auth will not work.");
    }
  }
  return createServerClient(url || "https://placeholder.supabase.co", key || "placeholder-anon-key", {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore in Server Components
        }
      },
    },
  });
}
