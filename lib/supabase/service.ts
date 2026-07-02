import { createClient } from "@supabase/supabase-js"

import { env } from "@/lib/env"

/**
 * Service-role Supabase client — bypasses RLS. Use only for:
 * - Background data pipelines (n8n, etc.)
 * - Cached server functions that read aggregated data and need to bypass
 *   per-user cookie-based auth (the cache key already scopes by user)
 *
 * NEVER expose this to the browser. Never call from client components.
 */
export function createSupabaseServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.")
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}