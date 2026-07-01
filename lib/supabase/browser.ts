import { createBrowserClient } from "@supabase/ssr"

import { env } from "@/lib/env"

/**
 * Supabase client for client components (login form, etc.).
 * Uses the public anon key; RLS enforces data isolation server-side.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}